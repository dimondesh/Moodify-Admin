/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Fingerprint,
  Upload,
  Loader2,
  Music,
  FlaskConical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const TestsTabContent = () => {
  const { t } = useTranslation();
  const [activeTest, setActiveTest] = useState<"analysis" | "embedding" | null>(
    null,
  );
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRunTest = async () => {
    if (!file || !activeTest) return;

    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("audioFile", file);

    try {
      const endpoint =
        activeTest === "analysis"
          ? "/admin/test-analysis"
          : "/admin/test-embedding";
      const response = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data.data);
    } catch (error: any) {
      console.error("Test failed", error);
      setResult({
        error: error.response?.data?.message || t("common.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <FlaskConical className="h-5 w-5 hidden sm:block text-sky-500" />
          {t("admin.tests.title")}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {t("admin.tests.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Карточка Теста Анализа */}
        <Card
          className="cursor-pointer hover:bg-zinc-800/50 transition-colors border-zinc-800"
          onClick={() => {
            setActiveTest("analysis");
            setResult(null);
            setFile(null);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.tests.titleAnalysis")}
            </CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {t("admin.tests.descAnalysis")}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {t("admin.tests.subDescAnalysis")}
            </p>
          </CardContent>
        </Card>

        {/* Карточка Теста Эмбеддингов */}
        <Card
          className="cursor-pointer hover:bg-zinc-800/50 transition-colors border-zinc-800"
          onClick={() => {
            setActiveTest("embedding");
            setResult(null);
            setFile(null);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("admin.tests.titleEmbedding")}
            </CardTitle>
            <Fingerprint className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {t("admin.tests.descEmbedding")}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {t("admin.tests.subDescEmbedding")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={activeTest !== null}
        onOpenChange={(open) => !open && setActiveTest(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeTest === "analysis" ? (
                <Activity className="h-5 w-5" />
              ) : (
                <Fingerprint className="h-5 w-5" />
              )}
              {activeTest === "analysis"
                ? t("admin.tests.dialogTitleAnalysis")
                : t("admin.tests.dialogTitleEmbedding")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="bg-zinc-800 border-zinc-700"
              />
              <Button
                onClick={handleRunTest}
                disabled={!file || loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {t("admin.tests.startButton")}
              </Button>
            </div>

            {result && (
              <ScrollArea className="h-[400px] w-full rounded-md border border-zinc-800 bg-black/50 p-4">
                {activeTest === "analysis" && !result.error ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                        <p className="text-[10px] uppercase text-zinc-500">
                          BPM
                        </p>
                        <p className="text-xl font-bold text-emerald-400">
                          {result.bpm}
                        </p>
                      </div>
                      <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                        <p className="text-[10px] uppercase text-zinc-500">
                          Camelot
                        </p>
                        <p className="text-xl font-bold text-sky-400">
                          {result.camelot}
                        </p>
                      </div>
                      <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                        <p className="text-[10px] uppercase text-zinc-500">
                          Beats
                        </p>
                        <p className="text-xl font-bold text-white">
                          {result.beats?.length}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-2 text-zinc-400">
                        {t("admin.tests.beatGridPreview")}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.beats
                          ?.slice(0, 20)
                          .map((b: number, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[10px] border-zinc-700"
                            >
                              {b.toFixed(2)}s
                            </Badge>
                          ))}
                        <span className="text-zinc-600 text-xs">...</span>
                      </div>
                    </div>
                  </div>
                ) : activeTest === "embedding" && !result.error ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                        <Music className="h-4 w-4" />{" "}
                        {t("admin.tests.vectorExtracted")}
                      </p>
                      <Badge variant="secondary">
                        {result.embedding?.length} {t("admin.tests.dimensions")}
                      </Badge>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded font-mono text-[10px] text-zinc-400 break-all leading-relaxed">
                      [ {result.embedding?.join(", ")} ]
                    </div>
                  </div>
                ) : (
                  <p className="text-red-400 text-sm">{result.error}</p>
                )}
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestsTabContent;
