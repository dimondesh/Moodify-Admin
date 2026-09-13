import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMusicStore } from "../../stores/useMusicStore";
import Sidebar, { type AdminSection } from "./Sidebar";
import StatusTabContent from "./StatusTabContent";
import SongsTabContent from "./SongsTabContent";
import AlbumsTabContent from "./AlbumsTabContent";
import ArtistsTabContent from "./ArtistsTabContent";
import TestsTabContent from "./TestsTabContent";

const SECTIONS = {
  status: StatusTabContent,
  songs: SongsTabContent,
  albums: AlbumsTabContent,
  artists: ArtistsTabContent,
  tests: TestsTabContent,
} as const;

const AdminPage = () => {
  const { fetchStats } = useMusicStore();
  const [section, setSection] = useState<AdminSection>("status");
  const Content = SECTIONS[section];

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <>
      <Helmet>
        <title>Moodify</title>
      </Helmet>
      <div className="flex h-screen flex-col overflow-hidden bg-[#0f0f0f] text-white md:flex-row">
        <Sidebar active={section} onNavigate={setSection} />
        <main className="min-h-0 flex-1 overflow-y-auto hide-scrollbar">
          <div className="p-4 sm:p-6">
            <Content />
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminPage;
