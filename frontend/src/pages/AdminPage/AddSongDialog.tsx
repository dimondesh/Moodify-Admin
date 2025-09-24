// moodify-admin-frontend/src/pages/AdminPage/AddSongDialog.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import { useMusicStore } from "../../stores/useMusicStore";
import { useEffect, useRef, useState } from "react";
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
import { Plus, Upload } from "lucide-react";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ScrollArea } from "../../components/ui/scroll-area";
import { MultiSelect } from "../../components/ui/multi-select";
import { Textarea } from "../../components/ui/textarea";
import { useTranslation } from "react-i18next";

interface NewSong {
  title: string;
  artistIds: string[];
  album: string;
  releaseYear: number;
  lyrics: string;
  genreIds: string[];
  moodIds: string[];
}

const AddSongDialog = () => {
  const { t } = useTranslation();
  const {
    albums,
    artists,
    fetchAlbums,
    fetchArtists,
    genres,
    moods,
    fetchGenres,
    fetchMoods,
  } = useMusicStore();
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [selectedMoodIds, setSelectedMoodIds] = useState<string[]>([]);

  const [newSong, setNewSong] = useState<NewSong>({
    title: "",
    artistIds: [],
    album: "",
    releaseYear: new Date().getFullYear(),
    lyrics: "",
    genreIds: [],
    moodIds: [],
  });

  const [files, setFiles] = useState<{
    audioFile: File | null; // MODIFIED
    imageFile: File | null;
  }>({
    audioFile: null, // MODIFIED
    imageFile: null,
  });

  const audioInputRef = useRef<HTMLInputElement>(null); // MODIFIED
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (songDialogOpen) {
      fetchArtists();
      fetchAlbums();
      fetchGenres();
      fetchMoods();
    }
  }, [songDialogOpen, fetchArtists, fetchAlbums, fetchGenres, fetchMoods]);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      if (!files.audioFile) {
        // MODIFIED
        return toast.error("Please upload an audio file.");
      }
      const isAlbumSelected = newSong.album && newSong.album !== "none";
      if (!isAlbumSelected && !files.imageFile) {
        return toast.error("Please upload an image file for the single.");
      }
      if (selectedArtistIds.length === 0) {
        return toast.error("Please select at least one artist.");
      }

      const formData = new FormData();
      formData.append("title", newSong.title);
      formData.append("artistIds", JSON.stringify(selectedArtistIds));
      formData.append("genreIds", JSON.stringify(selectedGenreIds));
      formData.append("moodIds", JSON.stringify(selectedMoodIds));
      if (newSong.album && newSong.album !== "none") {
        formData.append("albumId", newSong.album);
      }
      formData.append("releaseYear", newSong.releaseYear.toString());
      if (newSong.lyrics) {
        formData.append("lyrics", newSong.lyrics);
      }
      formData.append("audioFile", files.audioFile); // MODIFIED
      if (files.imageFile) {
        formData.append("imageFile", files.imageFile);
      }

      await axiosInstance.post("/admin/songs", formData);

      setNewSong({
        title: "",
        artistIds: [],
        album: "",
        releaseYear: new Date().getFullYear(),
        lyrics: "",
        genreIds: [],
        moodIds: [],
      });
      setSelectedArtistIds([]);
      setFiles({
        audioFile: null, // MODIFIED
        imageFile: null,
      });
      setSongDialogOpen(false);
      toast.success("Song added successfully");
    } catch (error: any) {
      toast.error(
        "Failed to add song: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isAlbumSelected = newSong.album && newSong.album !== "none";

  return (
    <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.songs.add")}
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[80vh] overflow-auto text-white no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-white">
            {t("admin.songs.addDialogTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.songs.addDialogDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            className={`flex items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer ${
              !isAlbumSelected && !files.imageFile
                ? "border-red-500"
                : "border-zinc-700"
            }`}
            onClick={() => imageInputRef.current?.click()}
          >
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              hidden
              onChange={(e) =>
                setFiles((prev) => ({ ...prev, imageFile: e.target.files![0] }))
              }
            />
            <div className="text-center">
              {files.imageFile ? (
                <div className="space-y-2">
                  <div className="text-sm text-emerald-500">
                    {t("admin.songs.imageSelected")}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {files.imageFile.name.slice(0, 20)}
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-zinc-800 rounded-full inline-block mb-2">
                    <Upload className="h-6 w-6 text-zinc-400" />
                  </div>
                  <div className="text-sm text-zinc-400 mb-2">
                    {!isAlbumSelected
                      ? t("admin.songs.artworkRequired")
                      : t("admin.songs.uploadArtwork")}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-zinc-200"
                  >
                    {t("admin.songs.chooseFile")}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* MODIFIED: Single audio file input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Аудиофайл (Обязательно)
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => audioInputRef.current?.click()}
                className="w-full text-zinc-200"
              >
                {files.audioFile
                  ? files.audioFile.name.slice(0, 30)
                  : "Выберите аудиофайл"}
              </Button>
              <input
                type="file"
                accept="audio/*"
                ref={audioInputRef}
                hidden
                onChange={(e) =>
                  setFiles((prev) => ({
                    ...prev,
                    audioFile: e.target.files![0],
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {t("admin.songs.fieldTitle")}
            </label>
            <Input
              value={newSong.title}
              onChange={(e) =>
                setNewSong({ ...newSong, title: e.target.value })
              }
              className="bg-zinc-800 border-zinc-700 text-zinc-400"
              placeholder={t("admin.songs.placeholderTitle")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {t("admin.songs.fieldArtists")}
            </label>
            <MultiSelect
              defaultValue={selectedArtistIds}
              onValueChange={setSelectedArtistIds}
              options={artists.map((artist) => ({
                label: artist.name,
                value: artist._id,
              }))}
              placeholder={t("admin.songs.placeholderArtists")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {t("admin.songs.fieldGenres")}
            </label>
            <MultiSelect
              defaultValue={selectedGenreIds}
              onValueChange={setSelectedGenreIds}
              options={genres.map((genre) => ({
                label: genre.name,
                value: genre._id,
              }))}
              placeholder={t("admin.songs.placeholderGenres")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {t("admin.songs.fieldMoods")}
            </label>
            <MultiSelect
              defaultValue={selectedMoodIds}
              onValueChange={setSelectedMoodIds}
              options={moods.map((mood) => ({
                label: mood.name,
                value: mood._id,
              }))}
              placeholder={t("admin.songs.placeholderMoods")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {t("admin.songs.fieldReleaseYear")}
            </label>
            <Input
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              value={newSong.releaseYear}
              onChange={(e) =>
                setNewSong({
                  ...newSong,
                  releaseYear: parseInt(e.target.value),
                })
              }
              className="bg-zinc-800 border-zinc-700 text-zinc-400"
              placeholder={t("admin.songs.placeholderReleaseYear")}
            />
          </div>

          <ScrollArea>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                {t("admin.songs.fieldAlbumOptional")}
              </label>
              <Select
                value={newSong.album}
                onValueChange={(value) =>
                  setNewSong({ ...newSong, album: value })
                }
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue
                    placeholder={t("admin.songs.placeholderAlbum")}
                    className="text-zinc-400"
                  />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="none">
                    {t("admin.songs.noAlbum")}
                  </SelectItem>
                  {albums.map((album) => (
                    <SelectItem key={album._id} value={album._id}>
                      {album.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ScrollArea>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              {t("admin.songs.fieldLyricsOptional")}
            </label>
            <Textarea
              value={newSong.lyrics}
              onChange={(e) =>
                setNewSong({ ...newSong, lyrics: e.target.value })
              }
              className="bg-zinc-800 border-zinc-700 text-zinc-400 h-32"
              placeholder={t("admin.songs.placeholderLyrics")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSongDialogOpen(false);
              setNewSong({
                title: "",
                artistIds: [],
                album: "",
                releaseYear: new Date().getFullYear(),
                lyrics: "",
                genreIds: [],
                moodIds: [],
              });
              setSelectedArtistIds([]);
              setFiles({
                audioFile: null,
                imageFile: null,
              });
            }}
            disabled={isLoading}
            className="text-zinc-400"
          >
            {t("admin.common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !newSong.title ||
              selectedArtistIds.length === 0 ||
              !files.audioFile ||
              (!isAlbumSelected && !files.imageFile)
            }
          >
            {isLoading ? t("admin.common.uploading") : t("admin.songs.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default AddSongDialog;
