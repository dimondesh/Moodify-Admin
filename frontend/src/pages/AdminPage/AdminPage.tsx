import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Outlet } from "react-router-dom";
import { useMusicStore } from "../../stores/useMusicStore";
import { cn } from "../../lib/utils";
import Sidebar from "./Sidebar";

const AdminPage = () => {
  const { fetchStats } = useMusicStore();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />
        <main className="min-h-0 flex-1 overflow-y-auto hide-scrollbar">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminPage;
