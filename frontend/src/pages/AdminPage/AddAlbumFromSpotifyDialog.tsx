// frontend/src/pages/AdminPage/AddAlbumFromSpotifyDialog.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader2, Plus } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid"; // <-- ДОБАВЛЕН ИМПОРТ UUID
import { axiosInstance } from "../../lib/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useMusicStore } from "../../stores/useMusicStore";
import { useTranslation } from "react-i18next";

const AddAlbumFromSpotifyDialog = () => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // <-- ДОБАВЛЕН СТЕЙТ ПРОГРЕССА
  const [spotifyAlbumUrl, setSpotifyAlbumUrl] = useState("");
  const [albumAudioZip, setAlbumAudioZip] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fetchAlbums } = useMusicStore();

  const handleZipFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAlbumAudioZip(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setUploadProgress(0);

    try {
      if (!spotifyAlbumUrl)
        return toast.error("Please enter Spotify Album URL.");
      if (!albumAudioZip) return toast.error("Please upload ZIP File.");

      const file = albumAudioZip;
      const chunkSize = 50 * 1024 * 1024; // Режем по 50 МБ
      const totalChunks = Math.ceil(file.size / chunkSize);
      const uploadId = uuidv4();

      // Показываем единый Toast для всего процесса
      toast.loading(`Uploading file in ${totalChunks} parts...`, {
        id: "upload-toast",
      });

      // 1. ОТПРАВКА ЧАНКОВ
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const chunkData = new FormData();
        chunkData.append("chunk", chunk);
        chunkData.append("uploadId", uploadId);
        chunkData.append("chunkIndex", (i + 1).toString());
        chunkData.append("totalChunks", totalChunks.toString());

        await axiosInstance.post("/admin/albums/upload-chunk", chunkData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            // Вычисляем общий процент загрузки всех чанков
            const currentChunkProgress =
              progressEvent.loaded / (progressEvent.total || 1);
            const overallProgress = Math.round(
              ((i + currentChunkProgress) / totalChunks) * 100,
            );
            setUploadProgress(overallProgress);
            console.log(`Upload Progress: ${overallProgress}%`);
          },
        });
      }

      // Обновляем Toast, когда загрузка завершена и началась обработка на сервере
      toast.loading(
        "Processing album on server (this may take a few minutes)...",
        { id: "upload-toast" },
      );
      setUploadProgress(100);

      // 2. ФИНАЛЬНЫЙ ЗАПРОС (Передаем URL и ID собранного файла)
      await axiosInstance.post("/admin/albums/upload-full-album", {
        spotifyAlbumUrl: spotifyAlbumUrl,
        uploadId: uploadId,
      });

      // Успех
      setSpotifyAlbumUrl("");
      setAlbumAudioZip(null);
      setDialogOpen(false);
      toast.success("Album successfully added from Spotify!", {
        id: "upload-toast",
      });
      fetchAlbums();
    } catch (error: any) {
      console.error("Error uploading album from Spotify:", error);
      toast.error(
        "Album wasn't added: " +
          (error.response?.data?.message || error.message),
        { id: "upload-toast" }, // Заменяем лоадинг на ошибку
      );
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
          <Plus className="mr-0 md:mr-2 h-4 w-4" />
          <p className="hidden md:inline">
            {" "}
            {t("admin.albums.addFromSpotify")}
          </p>{" "}
          <img
            src="/Spotify.svg"
            alt="Spotify logo"
            className="block md:hidden w-5"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {t("admin.albums.addSpotifyTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.albums.addSpotifyDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-zinc-200">
          <div className="space-y-2">
            <Label htmlFor="spotifyUrl">
              {t("admin.albums.fieldSpotifyUrl")}
            </Label>
            <Input
              id="spotifyUrl"
              value={spotifyAlbumUrl}
              onChange={(e) => setSpotifyAlbumUrl(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder={t("admin.albums.placeholderSpotifyUrl")}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="albumAudioZip">{t("admin.albums.fieldZip")}</Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleZipFileSelect}
              accept=".zip"
              className="hidden"
              id="albumAudioZip"
              disabled={isLoading}
            />
            <div
              className="flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer transition-colors hover:border-zinc-500"
              onClick={() => !isLoading && fileInputRef.current?.click()}
            >
              <div className="text-center">
                <div className="p-3 bg-zinc-800 rounded-full inline-block mb-2">
                  <Plus className="h-6 w-6 text-zinc-400" />
                </div>
                <div className="text-sm text-zinc-400 mb-2">
                  {albumAudioZip
                    ? albumAudioZip.name
                    : t("admin.albums.zipPrompt")}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={isLoading}
                >
                  {t("admin.albums.chooseZip")}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={isLoading}
            className="text-zinc-200"
          >
            {t("admin.common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-violet-500 hover:bg-violet-600 text-zinc-200 min-w-[120px]"
            disabled={isLoading || !spotifyAlbumUrl || !albumAudioZip}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="animate-spin text-white size-4" />
                <span>
                  {uploadProgress < 100
                    ? `${uploadProgress}%`
                    : "Processing..."}
                </span>
              </div>
            ) : (
              t("admin.albums.add")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumFromSpotifyDialog;
