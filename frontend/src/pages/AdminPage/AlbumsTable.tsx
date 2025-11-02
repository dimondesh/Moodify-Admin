// frontend/src/pages/AdminPage/AlbumsTable.tsx

import { Calendar, Music, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { useMusicStore } from "../../stores/useMusicStore";
import { Artist } from "../../types";
import EditAlbumDialog from "./EditAlbumDialog";
import { useTranslation } from "react-i18next";
import PaginationControls from "./PaginationControls";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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

  useEffect(() => {
    fetchPaginatedAlbums(currentPage, 50);
    fetchArtists();
  }, [fetchPaginatedAlbums, fetchArtists, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= albumsTotalPages) {
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
            <TableHead className="text-right text-gray-300">
              {t("admin.albums.tableActions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedAlbums.map((album) => (
            <TableRow
              key={album._id}
              className="hover:bg-[#2a2a2a] border-[#2a2a2a]"
            >
              <TableCell>
                <img
                  src={album.imageUrl}
                  alt={album.title}
                  className="h-10 w-10 rounded-md object-cover"
                />
              </TableCell>
              <TableCell className="font-medium text-white">
                {album.title}
              </TableCell>
              <TableCell
                className={`text-gray-400 ${isMobile ? "hidden" : ""}`}
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
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <EditAlbumDialog album={album} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAlbum(album._id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
    </div>
  );
};
export default AlbumsTable;
