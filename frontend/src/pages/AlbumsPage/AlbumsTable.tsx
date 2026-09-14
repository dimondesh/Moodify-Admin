import { Calendar, Music, Trash2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { useMusicStore } from "../../stores/useMusicStore";
import { Album, Artist } from "../../types";
import EditAlbumDialog from "./EditAlbumDialog";
import { useTranslation } from "react-i18next";
import PaginationControls from "@/components/PaginationControls";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  cancelAlbumUpload,
  getApiErrorMessage,
} from "../../lib/albumIngest";
import { cn } from "@/lib/utils";

const QUEUE_POLL_MS = 2500;

const statusBadgeStyles = {
  completed:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15",
  queued:
    "border-zinc-500/30 bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/15",
  preparing:
    "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15",
  progress:
    "relative overflow-hidden border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15",
} as const;

/** Same size as other status badges; progress is a fill inside the pill. */
function ProgressPill({
  percent,
  children,
}: {
  percent: number;
  children: ReactNode;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <Badge variant="outline" className={statusBadgeStyles.progress}>
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-amber-500/25 transition-[width] duration-300"
        style={{ width: `${clamped}%` }}
      />
      <span className="relative z-10">{children}</span>
    </Badge>
  );
}

function AlbumUploadStatusCell({ album }: { album: Album }) {
  const { t } = useTranslation();

  if (album.status !== "queued") {
    return (
      <Badge variant="outline" className={statusBadgeStyles.completed}>
        {t("admin.albums.statusCompleted")}
      </Badge>
    );
  }

  const phase = album.upload?.phase || "queued";
  const done = album.upload?.tracksDone ?? 0;
  const total = album.upload?.tracksTotal ?? 0;
  const percent = album.upload?.percent ?? 0;

  if (phase === "queued") {
    return (
      <Badge variant="outline" className={statusBadgeStyles.queued}>
        {t("admin.albums.statusQueued")}
      </Badge>
    );
  }

  if (phase === "preparing") {
    return (
      <Badge variant="outline" className={statusBadgeStyles.preparing}>
        {t("admin.albums.statusPreparing")}
      </Badge>
    );
  }

  const displayPercent =
    phase === "ingesting" && total > 0
      ? Math.round((done / total) * 100)
      : percent;

  return (
    <ProgressPill percent={displayPercent}>
      {t("admin.albums.statusDownloading", { percent: displayPercent })}
    </ProgressPill>
  );
}

const AlbumsTable = () => {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const { t } = useTranslation();
  const {
    paginatedAlbums,
    deleteAlbum,
    fetchPaginatedAlbums,
    artists,
    fetchArtists,
    albumsPage,
    albumsTotalPages,
  } = useMusicStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [albumToCancel, setAlbumToCancel] = useState<Album | null>(null);

  useEffect(() => {
    fetchPaginatedAlbums(currentPage, 50);
    fetchArtists();
  }, [fetchPaginatedAlbums, fetchArtists, currentPage]);

  const hasQueued = paginatedAlbums.some((a) => a.status === "queued");

  useEffect(() => {
    if (!hasQueued) return;
    const id = window.setInterval(() => {
      fetchPaginatedAlbums(currentPage, 50);
    }, QUEUE_POLL_MS);
    return () => window.clearInterval(id);
  }, [hasQueued, currentPage, fetchPaginatedAlbums]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= albumsTotalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleConfirmCancelUpload = async () => {
    if (!albumToCancel) return;
    const albumId = albumToCancel._id;
    setCancellingId(albumId);
    setAlbumToCancel(null);
    try {
      await cancelAlbumUpload(albumId);
      toast.success(t("admin.albums.cancelSuccess"));
      await fetchPaginatedAlbums(currentPage, 50);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("admin.albums.cancelFailed")));
    } finally {
      setCancellingId(null);
    }
  };

  const getArtistNames = (artistsData: string[] | Artist[] | undefined) => {
    if (
      !artistsData ||
      artistsData.length === 0 ||
      !artists ||
      artists.length === 0
    )
      return "N/A";

    const names = artistsData
      .map((item) => {
        if (typeof item === "string") {
          const artist = artists.find((a) => a._id === item);
          return artist ? artist.name : null;
        } else if (item && typeof item === "object" && "name" in item) {
          return (item as Artist).name;
        }
        return null;
      })
      .filter(Boolean);

    return names.join(", ") || "N/A";
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2a2a2a] hover:bg-[#2a2a2a]">
            <TableHead className="w-[50px] text-gray-300"></TableHead>
            <TableHead className="text-gray-300">
              {t("admin.albums.tableTitle")}
            </TableHead>
            <TableHead className={`text-gray-300 ${isMobile ? "hidden" : ""}`}>
              {t("admin.albums.tableArtists")}
            </TableHead>
            <TableHead className={`text-gray-300 ${isMobile ? "hidden" : ""}`}>
              {t("admin.albums.tableReleaseYear")}
            </TableHead>
            <TableHead className={`text-gray-300 ${isMobile ? "hidden" : ""}`}>
              {t("admin.albums.tableSongs")}
            </TableHead>
            <TableHead className="text-gray-300">
              {t("admin.albums.tableStatus")}
            </TableHead>
            <TableHead className="text-right text-gray-300">
              {t("admin.albums.tableActions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedAlbums.map((album) => (
            <TableRow
              key={album._id}
              className="group hover:bg-[#2a2a2a] border-[#2a2a2a]"
            >
              <TableCell>
                <img
                  src={album.imageUrl}
                  alt={album.title}
                  className="h-10 w-10 rounded object-cover min-w-10"
                />
              </TableCell>
              <TableCell className="font-medium text-white max-w-40 sm:max-w-0 truncate">
                {album.title}
              </TableCell>
              <TableCell
                className={`text-gray-400 truncate ${isMobile ? "hidden" : ""}`}
              >
                {getArtistNames(album.artist)}
              </TableCell>
              <TableCell
                className={`text-gray-400 ${isMobile ? "hidden" : ""}`}
              >
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {album.releaseYear}
                </span>
              </TableCell>
              <TableCell className={` ${isMobile ? "hidden" : ""}`}>
                <span className="inline-flex items-center gap-1 text-gray-400">
                  <Music className="h-4 w-4" />
                  {album.songs.length}{" "}
                  {album.songs.length === 1
                    ? t("sidebar.subtitle.song")
                    : t("sidebar.subtitle.songs")}
                </span>
              </TableCell>
              <TableCell>
                <AlbumUploadStatusCell album={album} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  {album.status === "queued" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAlbumToCancel(album)}
                      disabled={cancellingId === album._id}
                      className={cn(
                        "opacity-0 transition-opacity group-hover:opacity-100",
                        "text-red-400 hover:text-red-300 hover:bg-red-400/10 disabled:opacity-40",
                      )}
                      title={t("admin.albums.cancelUpload")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <EditAlbumDialog album={album} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlbum(album._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationControls
        currentPage={albumsPage}
        totalPages={albumsTotalPages}
        onPageChange={handlePageChange}
      />

      <AlertDialog
        open={Boolean(albumToCancel)}
        onOpenChange={(open) => {
          if (!open) setAlbumToCancel(null);
        }}
      >
        <AlertDialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.albums.cancelConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {t("admin.albums.cancelConfirmDesc", {
                title: albumToCancel?.title ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white">
              {t("admin.common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancelUpload}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {t("admin.albums.cancelConfirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default AlbumsTable;
