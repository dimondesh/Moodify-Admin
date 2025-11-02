// frontend/src/pages/AdminPage/SongsTable.tsx

import { memo, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useMusicStore } from "../../stores/useMusicStore";
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import EditSongDialog from "./EditSongDialog";
import { Calendar, Trash2 } from "lucide-react";
import { Artist } from "@/types";
import { useTranslation } from "react-i18next";
import PaginationControls from "./PaginationControls";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const SongsTable = memo(() => {
  const isMobile = useMediaQuery("(max-width: 1024px)");

  const { t } = useTranslation();
  const {
    paginatedSongs,
    isLoading,
    error,
    deleteSong,
    artists,
    fetchArtists,
    fetchPaginatedSongs,
    songsPage,
    songsTotalPages,
  } = useMusicStore();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchArtists();
    fetchPaginatedSongs(currentPage, 50);
  }, [fetchArtists, fetchPaginatedSongs, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= songsTotalPages) {
      setCurrentPage(newPage);
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
      .map((item: string | Artist) => {
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

  if (isLoading && paginatedSongs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2a2a2a] hover:bg-[#2a2a2a]">
            <TableHead className="w-[50px] text-gray-300"></TableHead>
            <TableHead className="text-gray-300">
              {t("admin.songs.tableTitle")}
            </TableHead>
            <TableHead className={`text-gray-300 ${isMobile ? "hidden" : ""}`}>
              {t("admin.songs.tableArtist")}
            </TableHead>
            <TableHead className={`text-gray-300 ${isMobile ? "hidden" : ""}`}>
              {t("admin.songs.tableReleaseDate")}
            </TableHead>
            <TableHead className="text-right text-gray-300">
              {t("admin.songs.tableActions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedSongs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                {t("admin.songs.tableNoSongs")}
              </TableCell>
            </TableRow>
          ) : (
            paginatedSongs.map((song) => (
              <TableRow
                key={song._id}
                className="hover:bg-[#2a2a2a] border-[#2a2a2a]"
              >
                <TableCell>
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="size-10 rounded object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium text-white">
                  {song.title}
                </TableCell>
                <TableCell
                  className={`text-gray-400 ${isMobile ? "hidden" : ""}`}
                >
                  {getArtistNames(song.artist)}
                </TableCell>
                <TableCell
                  className={`text-gray-400 ${isMobile ? "hidden" : ""}`}
                >
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {song.createdAt.split("T")[0]}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <EditSongDialog song={song} />
                    <Button
                      variant={"ghost"}
                      size={"sm"}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      onClick={() => deleteSong(song._id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <PaginationControls
        currentPage={songsPage}
        totalPages={songsTotalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
});
export default SongsTable;
