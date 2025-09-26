// frontend/src/pages/AdminPage/AlbumsTabContent.tsx

import { Library } from "lucide-react";
import AddAlbumDialog from "./AddAlbumDialog";
import AddAlbumFromSpotifyDialog from "./AddAlbumFromSpotifyDialog";

import AlbumsTable from "./AlbumsTable";
import { useTranslation } from "react-i18next";

const AlbumsTabContent = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Library className="h-5 w-5 text-violet-500" />
            {t("admin.albums.title")}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {t("admin.albums.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <AddAlbumDialog />
          <AddAlbumFromSpotifyDialog />
        </div>
      </div>
      <AlbumsTable />
    </div>
  );
};
export default AlbumsTabContent;
