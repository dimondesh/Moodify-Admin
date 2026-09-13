// frontend/src/pages/AdminPage/AdminPage.tsx

import {
  Activity,
  Album,
  FlaskConical,
  Music,
  Users2,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import DashboardStats from "./DashboardStats";
import Header from "./Header";
import SongsTabContent from "./SongsTabContent";
import AlbumsTabContent from "./AlbumsTabContent";
import ArtistsTabContent from "./ArtistsTabContent";
import { useEffect } from "react";
import { useMusicStore } from "../../stores/useMusicStore";
import { useTranslation } from "react-i18next";
import StatusTabContent from "./StatusTabContent";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Helmet } from "react-helmet-async";
import TestsTabContent from "./TestsTabContent";

const AdminPage = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { t } = useTranslation();
  const { fetchStats } = useMusicStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <>
      <Helmet>
        <title>Moodify Admin</title>
      </Helmet>
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
                  <Activity
                    className={`mr-2 size-4 ${isMobile ? "ml-2" : ""}`}
                  />
                  {isMobile ? "" : t("admin.tabs.status")}
                </TabsTrigger>
                <TabsTrigger
                  value="songs"
                  className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white text-gray-300 hover:text-white"
                >
                  <Music className={`mr-2 size-4 ${isMobile ? "ml-2" : ""}`} />
                  {isMobile ? "" : t("admin.tabs.songs")}
                </TabsTrigger>
                <TabsTrigger
                  value="albums"
                  className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white text-gray-300 hover:text-white"
                >
                  <Album className={`mr-2 size-4 ${isMobile ? "ml-2" : ""}`} />
                  {isMobile ? "" : t("admin.tabs.albums")}
                </TabsTrigger>
                <TabsTrigger
                  value="artists"
                  className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white text-gray-300 hover:text-white"
                >
                  <Users2 className={`mr-2 size-4 ${isMobile ? "ml-2" : ""}`} />
                  {isMobile ? "" : t("admin.tabs.artists")}
                </TabsTrigger>
                <TabsTrigger
                  value="tests"
                  className="data-[state=active]:bg-zinc-800"
                >
                  <FlaskConical className="mr-2 h-4 w-4" />
                  {isMobile ? "" : t("admin.tabs.tests")}
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
              <TabsContent value="tests">
                <TestsTabContent />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
