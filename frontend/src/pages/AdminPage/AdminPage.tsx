import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMusicStore } from "../../stores/useMusicStore";
import { cn } from "../../lib/utils";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const Content = SECTIONS[section];

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <Helmet>
        <title>Moodify</title>
      </Helmet>
      <div
        className={cn(
          "flex h-screen flex-col overflow-hidden bg-[#0f0f0f] text-white transition-transform duration-300 ease-in-out md:flex-row md:translate-x-0",
          mobileOpen ? "translate-x-50" : "translate-x-0",
        )}
      >
        <Sidebar
          active={section}
          onNavigate={setSection}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />
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
