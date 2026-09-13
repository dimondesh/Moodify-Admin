/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosInstance } from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const TestsPage = () => {
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card
          className="cursor-pointer border-[#2a2a2a] bg-[#1a1a1a] transition-colors hover:bg-[#2a2a2a]"
          onClick={() => {
            setActiveTest("analysis");
            setResult(null);
            setFile(null);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {t("admin.tests.titleAnalysis")}
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {t("admin.tests.descAnalysis")}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {t("admin.tests.subDescAnalysis")}
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer border-[#2a2a2a] bg-[#1a1a1a] transition-colors hover:bg-[#2a2a2a]"
          onClick={() => {
            setActiveTest("embedding");
            setResult(null);
            setFile(null);
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {t("admin.tests.titleEmbedding")}
            </CardTitle>
            <div className="rounded-lg bg-sky-500/10 p-2">
              <Fingerprint className="h-4 w-4 text-sky-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {t("admin.tests.descEmbedding")}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {t("admin.tests.subDescEmbedding")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={activeTest !== null}
        onOpenChange={(open) => !open && setActiveTest(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeTest === "analysis" ? (
                <Activity className="h-5 w-5 text-emerald-500" />
              ) : (
                <Fingerprint className="h-5 w-5 text-sky-500" />
              )}
              {activeTest === "analysis"
                ? t("admin.tests.dialogTitleAnalysis")
                : t("admin.tests.dialogTitleEmbedding")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex flex-col gap-4">
              {/* Кастомный Drag & Drop Input */}
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title=""
                />
                <div
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all duration-200 ${
                    file
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-zinc-700 bg-zinc-800/30 group-hover:border-zinc-500 group-hover:bg-zinc-800/50"
                  }`}
                >
                  {file ? (
                    <div className="flex flex-col items-center text-center px-4">
                      <Music className="h-8 w-8 text-emerald-500 mb-2" />
                      <p className="text-sm font-medium text-emerald-400 truncate max-w-[250px] sm:max-w-[400px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center text-zinc-400 px-4">
                      <Upload className="h-8 w-8 mb-2 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                      <p className="text-sm font-medium text-zinc-300 mb-1">
                        {t("admin.common.chooseFile")}
                      </p>
                      <p className="text-xs text-zinc-500">MP3, WAV, FLAC</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Кнопка запуска */}
              <Button
                onClick={handleRunTest}
                disabled={!file || loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Activity className="h-5 w-5 mr-2" />
                )}
                {t("admin.tests.startButton")}
              </Button>
            </div>

            {result && (
              <ScrollArea className="h-[400px] w-full rounded-md border border-zinc-800 bg-black/50 p-4">
                {activeTest === "analysis" && !result.error ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 flex flex-col items-center justify-center">
                        <p className="text-[10px] uppercase text-zinc-500 tracking-wider">
                          BPM
                        </p>
                        <p className="text-3xl font-bold text-emerald-400 mt-1">
                          {result.bpm}
                        </p>
                      </div>
                      <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 flex flex-col items-center justify-center">
                        <p className="text-[10px] uppercase text-zinc-500 tracking-wider">
                          Camelot
                        </p>
                        <p className="text-3xl font-bold text-sky-400 mt-1">
                          {result.camelot}
                        </p>
                      </div>
                      <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 flex flex-col items-center justify-center">
                        <p className="text-[10px] uppercase text-zinc-500 tracking-wider">
                          Beats
                        </p>
                        <p className="text-3xl font-bold text-white mt-1">
                          {result.beats?.length}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-3 text-zinc-400 flex items-center gap-2">
                        <Activity className="h-3 w-3" />
                        {t("admin.tests.beatGridPreview")}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.beats
                          ?.slice(0, 30)
                          .map((b: number, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[10px] border-zinc-700 bg-zinc-900/50 text-zinc-300 font-mono"
                            >
                              {b.toFixed(2)}s
                            </Badge>
                          ))}
                        {result.beats?.length > 30 && (
                          <span className="text-zinc-600 text-xs ml-1 self-center">
                            ...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : activeTest === "embedding" && !result.error ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
                      <p className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                        <Music className="h-4 w-4" />{" "}
                        {t("admin.tests.vectorExtracted")}
                      </p>
                      <Badge
                        variant="secondary"
                        className="bg-sky-500/10 text-sky-400 border-none"
                      >
                        {result.embedding?.length} {t("admin.tests.dimensions")}
                      </Badge>
                    </div>
                    <div className="bg-black/80 p-4 rounded-xl font-mono text-xs text-zinc-400 break-all leading-relaxed border border-zinc-800/50">
                      <span className="text-zinc-600">[</span>{" "}
                      {result.embedding?.join(", ")}{" "}
                      <span className="text-zinc-600">]</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-red-400 p-6 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-sm font-medium text-center">
                      {result.error}
                    </p>
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestsPage;
