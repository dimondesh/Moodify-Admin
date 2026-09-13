import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Map, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MapEntity = "tracks" | "albums" | "artists" | "playlists";

type MapPoint = {
  id: string;
  title: string;
  x: number;
  y: number;
  group: string;
  sub: string;
};

type ViewTransform = { scale: number; tx: number; ty: number };

const ENTITIES: MapEntity[] = ["tracks", "albums", "artists", "playlists"];

const HOVER_LABELS: Record<
  MapEntity,
  { groupKey: string; subKey: string | null }
> = {
  tracks: {
    groupKey: "admin.embeddingsMap.genre",
    subKey: "admin.embeddingsMap.mood",
  },
  albums: {
    groupKey: "admin.embeddingsMap.type",
    subKey: "admin.embeddingsMap.artist",
  },
  artists: {
    groupKey: "admin.embeddingsMap.entityArtists",
    subKey: null,
  },
  playlists: {
    groupKey: "admin.embeddingsMap.type",
    subKey: "admin.embeddingsMap.source",
  },
};

const PALETTE = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

const MIN_SCALE = 0.25;
const MAX_SCALE = 24;
const IDENTITY: ViewTransform = { scale: 1, tx: 0, ty: 0 };

function colorForLabel(label: string, labels: string[]) {
  const idx = labels.indexOf(label);
  if (idx < 0) return "#d946ef";
  return PALETTE[idx % PALETTE.length];
}

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function zoomAt(
  view: ViewTransform,
  mx: number,
  my: number,
  factor: number,
): ViewTransform {
  const scale = clampScale(view.scale * factor);
  const ratio = scale / view.scale;
  return {
    scale,
    tx: mx - (mx - view.tx) * ratio,
    ty: my - (my - view.ty) * ratio,
  };
}

const EmbeddingsMapPage = () => {
  const { t } = useTranslation();
  const [entity, setEntity] = useState<MapEntity>("tracks");
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [meta, setMeta] = useState<{ count: number; dimensions: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<{
    point: MapPoint;
    clientX: number;
    clientY: number;
  } | null>(null);
  const [view, setView] = useState<ViewTransform>(IDENTITY);
  const [panning, setPanning] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const viewRef = useRef(view);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    tx: number;
    ty: number;
  } | null>(null);
  const [size, setSize] = useState({ w: 800, h: 560 });

  viewRef.current = view;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHover(null);
    try {
      const { data } = await axiosInstance.get("/admin/embeddings/map", {
        params: { entity },
      });
      setPoints(data.points ?? []);
      setMeta(data.meta ?? null);
      setView(IDENTITY);
    } catch (err: unknown) {
      console.error(err);
      setError(t("admin.embeddingsMap.loadError"));
      setPoints([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [entity, t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({
        w: Math.max(320, Math.floor(width)),
        h: Math.max(360, Math.floor(height)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading, points.length]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setView((v) => zoomAt(v, mx, my, factor));
    };

    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [loading, points.length]);

  const labels = useMemo(() => {
    if (entity === "artists") return [];
    const set = new Set(points.map((p) => p.group));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [points, entity]);

  const layout = useMemo(() => {
    if (!points.length) return null;
    const pad = 28;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of points) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const plotW = size.w - pad * 2;
    const plotH = size.h - pad * 2;

    return points.map((p) => ({
      ...p,
      cx: pad + ((p.x - minX) / spanX) * plotW,
      cy: pad + (1 - (p.y - minY) / spanY) * plotH,
    }));
  }, [points, size]);

  const hoverLabels = HOVER_LABELS[entity];

  const zoomButton = (factor: number) => {
    setView((v) => zoomAt(v, size.w / 2, size.h / 2, factor));
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const svg = svgRef.current;
    if (!svg) return;
    svg.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      tx: viewRef.current.tx,
      ty: viewRef.current.ty,
    };
    setPanning(true);
    setHover(null);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    setView({
      scale: viewRef.current.scale,
      tx: drag.tx + (e.clientX - drag.x),
      ty: drag.ty + (e.clientY - drag.y),
    });
  };

  const endPan = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      setPanning(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-5.5rem)] min-h-[28rem] flex-col gap-4 md:h-[calc(100vh-3rem)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Map className="hidden size-5 text-fuchsia-500 sm:block" />
            {t("admin.embeddingsMap.title")}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {t("admin.embeddingsMap.description")}
            {meta && meta.count > 0
              ? ` · ${t("admin.embeddingsMap.meta", {
                  count: meta.count,
                  dim: meta.dimensions,
                })}`
              : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-1">
            {ENTITIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setEntity(item)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                  entity === item
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                {t(`admin.embeddingsMap.entity.${item}`)}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={load}
            disabled={loading}
            className="border-[#2a2a2a] bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
            aria-label={t("admin.embeddingsMap.refresh")}
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#121212]">
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2 text-gray-400">
            <Loader2 className="size-5 animate-spin" />
            {t("admin.embeddingsMap.computing")}
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
            <p>{error}</p>
            <Button
              type="button"
              variant="outline"
              onClick={load}
              className="border-[#2a2a2a] bg-[#1a1a1a]"
            >
              {t("admin.embeddingsMap.retry")}
            </Button>
          </div>
        ) : !layout?.length ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            {t("admin.embeddingsMap.empty")}
          </div>
        ) : (
          <>
            <div className="absolute right-3 top-3 z-10 flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => zoomButton(1.2)}
                className="size-8 border-[#2a2a2a] bg-[#1a1a1a]/80 text-gray-300 backdrop-blur-sm hover:bg-[#2a2a2a] hover:text-white"
                aria-label={t("admin.embeddingsMap.zoomIn")}
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => zoomButton(1 / 1.2)}
                className="size-8 border-[#2a2a2a] bg-[#1a1a1a]/80 text-gray-300 backdrop-blur-sm hover:bg-[#2a2a2a] hover:text-white"
                aria-label={t("admin.embeddingsMap.zoomOut")}
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setView(IDENTITY)}
                className="h-8 border-[#2a2a2a] bg-[#1a1a1a]/80 px-2 text-xs text-gray-300 backdrop-blur-sm hover:bg-[#2a2a2a] hover:text-white"
              >
                {t("admin.embeddingsMap.resetView")}
              </Button>
            </div>

            <svg
              ref={svgRef}
              width={size.w}
              height={size.h}
              className={cn(
                "h-full w-full touch-none",
                panning ? "cursor-grabbing" : "cursor-grab",
              )}
              role="img"
              aria-label={t("admin.embeddingsMap.title")}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endPan}
              onPointerCancel={endPan}
            >
              <g
                transform={`translate(${view.tx} ${view.ty}) scale(${view.scale})`}
              >
                {layout.map((p) => {
                  const label = entity === "artists" ? "Artist" : p.group;
                  const r = (hover?.point.id === p.id ? 7 : 5.5) / view.scale;
                  return (
                    <circle
                      key={p.id}
                      cx={p.cx}
                      cy={p.cy}
                      r={r}
                      fill={
                        entity === "artists"
                          ? "#d946ef"
                          : colorForLabel(label, labels)
                      }
                      fillOpacity={0.9}
                      stroke="#0a0a0a"
                      strokeWidth={0.75 / view.scale}
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        if (dragRef.current) return;
                        setHover({
                          point: p,
                          clientX: e.clientX,
                          clientY: e.clientY,
                        });
                      }}
                      onMouseMove={(e) => {
                        if (dragRef.current) return;
                        setHover({
                          point: p,
                          clientX: e.clientX,
                          clientY: e.clientY,
                        });
                      }}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
              </g>
            </svg>

            {labels.length > 0 && labels.length <= 24 && (
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex max-h-24 flex-wrap gap-x-3 gap-y-1 overflow-hidden rounded-lg bg-black/50 px-3 py-2 text-[11px] text-gray-300 backdrop-blur-sm">
                {labels.map((label) => (
                  <span key={label} className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ background: colorForLabel(label, labels) }}
                    />
                    {label}
                  </span>
                ))}
              </div>
            )}

            {hover && (
              <div
                className="pointer-events-none fixed z-50 max-w-xs rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-sm shadow-lg"
                style={{
                  left: hover.clientX + 12,
                  top: hover.clientY + 12,
                }}
              >
                <div className="font-medium text-white">{hover.point.title}</div>
                {entity !== "artists" && (
                  <>
                    <div className="mt-1 text-xs text-gray-400">
                      {t(hoverLabels.groupKey)}: {hover.point.group}
                    </div>
                    {hoverLabels.subKey && (
                      <div className="text-xs text-gray-400">
                        {t(hoverLabels.subKey)}: {hover.point.sub}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmbeddingsMapPage;
