// frontend/src/pages/AdminPage/ArtistsTabContent.tsx

import { Users2 } from "lucide-react";
import AddArtistDialog from "./AddArtistDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import ArtistsTable from "./ArtistsTable";
import { useTranslation } from "react-i18next";

const ArtistsTabContent = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users2 className="h-5 w-5 text-orange-500" />
            {t("admin.artists.title")}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {t("admin.artists.description")}
          </p>
        </div>
        <AddArtistDialog />
      </div>
      <ArtistsTable />
    </div>
  );
};

export default ArtistsTabContent;
