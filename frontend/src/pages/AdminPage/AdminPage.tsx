// frontend/src/pages/AdminPage/AdminPage.tsx

import { Activity, Album, Home, Music, Users2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useAuthStore } from "../../stores/useAuthStore";
import DashboardStats from "./DashboardStats";
import Header from "./Header";
import SongsTabContent from "./SongsTabContent";
import AlbumsTabContent from "./AlbumsTabContent";
import ArtistsTabContent from "./ArtistsTabContent";
import { useEffect } from "react";
import { useMusicStore } from "../../stores/useMusicStore";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StatusTabContent from "./StatusTabContent";

const AdminPage = () => {
  const { t } = useTranslation();
  const { isAdmin, isLoading } = useAuthStore();
  const { fetchStats } = useMusicStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const navigate = useNavigate();
  if (!isAdmin && !isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-zinc-800 to-zinc-900 text-6xl text-zinc-200">
        {t("admin.unauthorized")}
        <Button
          onClick={() => navigate("/")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto mt-4"
        >
          <Home className="mr-2 h-4 w-4" />
          {t("admin.backToHome")}
        </Button>
      </div>
    );

  return (
    <div className="h-screen bg-[#0f0f0f] text-white flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="p-4 sm:p-6">
          <DashboardStats />
          <Tabs defaultValue="status" className="space-y-6 mt-6">
            <TabsList className="p-1 bg-[#2a2a2a] rounded-lg">
              <TabsTrigger
                value="status"
                className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white text-gray-300 hover:text-white"
              >
                <Activity className="mr-2 size-4" />
                {t("admin.tabs.status")}
              </TabsTrigger>
              <TabsTrigger
                value="songs"
                className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white text-gray-300 hover:text-white"
              >
                <Music className="mr-2 size-4" />
                {t("admin.tabs.songs")}
              </TabsTrigger>
              <TabsTrigger
                value="albums"
                className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white text-gray-300 hover:text-white"
              >
                <Album className="mr-2 size-4" />
                {t("admin.tabs.albums")}
              </TabsTrigger>
              <TabsTrigger
                value="artists"
                className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white text-gray-300 hover:text-white"
              >
                <Users2 className="mr-2 size-4" />
                {t("admin.tabs.artists")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="status">
              <StatusTabContent />
            </TabsContent>
            <TabsContent value="songs">
              <SongsTabContent />
            </TabsContent>
            <TabsContent value="albums">
              <AlbumsTabContent />
            </TabsContent>
            <TabsContent value="artists">
              <ArtistsTabContent />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
