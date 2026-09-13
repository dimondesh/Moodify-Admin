import { Activity, Cloud, Power, BrainCircuit, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { axiosInstance } from "@/lib/axios";
import DashboardStats from "./DashboardStats";

type ServiceStatus = "idle" | "checking" | "online" | "offline";

const StatusTabContent = () => {
  const { t } = useTranslation();
  const [mainBackendStatus, setMainBackendStatus] =
    useState<ServiceStatus>("idle");
  const [analysisServiceStatus, setAnalysisServiceStatus] =
    useState<ServiceStatus>("idle");
  const [embeddingServiceStatus, setEmbeddingServiceStatus] =
    useState<ServiceStatus>("idle");

  const checkMainBackendStatus = async () => {
    setMainBackendStatus("checking");
    try {
      const response = await axiosInstance.get(`/stats/health`, {
        withCredentials: true,
      });

      if (response.status === 200 && response.data.status === "ok") {
        setMainBackendStatus("online");
      } else {
        setMainBackendStatus("offline");
      }
    } catch (error) {
      console.error("Error checking main backend status:", error);
      setMainBackendStatus("offline");
    }
  };

  const checkAnalysisServiceStatus = async () => {
    setAnalysisServiceStatus("checking");
    try {
      const response = await axiosInstance.get(`/stats/health/analysis`);

      if (response.status === 200 && response.data.status === "OK") {
        setAnalysisServiceStatus("online");
      } else {
        setAnalysisServiceStatus("offline");
      }
    } catch (error) {
      console.error("Error checking analysis service status:", error);
      setAnalysisServiceStatus("offline");
    }
  };

  const checkEmbeddingServiceStatus = async () => {
    setEmbeddingServiceStatus("checking");
    try {
      const response = await axiosInstance.get(`/stats/health/embedding`);

      if (response.status === 200 && response.data.status === "OK") {
        setEmbeddingServiceStatus("online");
      } else {
        setEmbeddingServiceStatus("offline");
      }
    } catch (error) {
      console.error("Error checking embedding service status:", error);
      setEmbeddingServiceStatus("offline");
    }
  };

  useEffect(() => {
    checkMainBackendStatus();
    checkAnalysisServiceStatus();
    checkEmbeddingServiceStatus();
  }, []);

  const StatusBadge = ({ status }: { status: ServiceStatus }) => {
    const styles: Record<ServiceStatus, string> = {
      online:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15",
      offline:
        "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/15",
      checking:
        "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15",
      idle: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/15",
    };

    const labels: Record<ServiceStatus, string> = {
      online: t("admin.status.online"),
      offline: t("admin.status.offline"),
      checking: t("admin.status.checking"),
      idle: t("admin.status.idle"),
    };

    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Activity className="hidden h-5 w-5 text-red-500 sm:block" />
            {t("admin.status.dbStatsTitle")}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {t("admin.status.dbStatsDescription")}
          </p>
        </div>
        <DashboardStats />
      </section>

      <div className="border-t border-[#2a2a2a]" />

      <section className="space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Cloud className="hidden h-5 w-5 text-sky-500 sm:block" />
            {t("admin.status.title")}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {t("admin.status.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("admin.status.backendStatus")}
              </CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <StatusBadge status={mainBackendStatus} />
                <Button
                  onClick={checkMainBackendStatus}
                  disabled={mainBackendStatus === "checking"}
                >
                  <Power className="mr-2 h-4 w-4" />
                  {t("admin.status.wakeUpButton")}
                </Button>
              </div>
              <p className="pt-2 text-xs text-muted-foreground">
                {t("admin.status.wakeUpDescription")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("admin.status.analysisServiceStatus")}
              </CardTitle>
              <BrainCircuit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <StatusBadge status={analysisServiceStatus} />
                <Button
                  onClick={checkAnalysisServiceStatus}
                  disabled={analysisServiceStatus === "checking"}
                >
                  <Power className="mr-2 h-4 w-4" />
                  {t("admin.status.wakeUpButton")}
                </Button>
              </div>
              <p className="pt-2 text-xs text-muted-foreground">
                {t("admin.status.wakeUpDescription")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Embedding Service
              </CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <StatusBadge status={embeddingServiceStatus} />
                <Button
                  onClick={checkEmbeddingServiceStatus}
                  disabled={embeddingServiceStatus === "checking"}
                >
                  <Power className="mr-2 h-4 w-4" />
                  {t("admin.status.wakeUpButton")}
                </Button>
              </div>
              <p className="pt-2 text-xs text-muted-foreground">
                {t("admin.status.wakeUpDescription")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default StatusTabContent;
