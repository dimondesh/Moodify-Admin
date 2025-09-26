// frontend/src/pages/AdminPage/SongsTabContent.tsx

import { Music } from "lucide-react";

import SongsTable from "./SongsTable";
import AddSongDialog from "./AddSongDialog";
import { useTranslation } from "react-i18next";

const SongsTabContent = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Music className="size-5 text-emerald-500" />
            {t("admin.songs.title")}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {t("admin.songs.description")}
          </p>
        </div>
        <AddSongDialog />
      </div>
      <SongsTable />
    </div>
  );
};

export default SongsTabContent;
