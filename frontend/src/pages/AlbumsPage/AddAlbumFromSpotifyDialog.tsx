import { Loader2, Plus } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
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
import {
  getApiErrorMessage,
  ingestAlbumFromSpotify,
} from "../../lib/albumIngest";
import { useMusicStore } from "../../stores/useMusicStore";
import { useTranslation } from "react-i18next";

const UPLOAD_TOAST_ID = "upload-toast";

const AddAlbumFromSpotifyDialog = () => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [spotifyAlbumUrl, setSpotifyAlbumUrl] = useState("");
  const [albumAudioZip, setAlbumAudioZip] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fetchAlbums } = useMusicStore();

  const handleZipFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAlbumAudioZip(file);
  };

  const resetForm = () => {
    setSpotifyAlbumUrl("");
    setAlbumAudioZip(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!spotifyAlbumUrl) {
      toast.error("Please enter Spotify Album URL.");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      await ingestAlbumFromSpotify(spotifyAlbumUrl, albumAudioZip, {
        onUploadProgress: setUploadProgress,
        onStatus: (message) =>
          toast.loading(message, { id: UPLOAD_TOAST_ID }),
      });

      resetForm();
      setDialogOpen(false);
      toast.success("Album successfully added from Spotify!", {
        id: UPLOAD_TOAST_ID,
      });
      fetchAlbums();
    } catch (error: unknown) {
      console.error("Error uploading album from Spotify:", error);
      toast.error(
        "Album wasn't added: " + getApiErrorMessage(error),
        { id: UPLOAD_TOAST_ID },
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
          <p className="hidden md:inline">{t("admin.albums.addFromSpotify")}</p>
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
            <Label htmlFor="albumAudioZip">
              {t("admin.albums.fieldZipOptional")}
            </Label>
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
                    : t("admin.albums.zipPromptOptional")}
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
            disabled={isLoading || !spotifyAlbumUrl}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="animate-spin text-white size-4" />
                <span>
                  {albumAudioZip && uploadProgress < 100
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
