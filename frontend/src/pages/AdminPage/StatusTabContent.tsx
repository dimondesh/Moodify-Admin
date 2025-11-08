import { Activity, Cloud, Power, BrainCircuit } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { axiosInstance } from "@/lib/axios";

type ServiceStatus = "idle" | "checking" | "online" | "offline";

const StatusTabContent = () => {
  const { t } = useTranslation();
  const [mainBackendStatus, setMainBackendStatus] =
    useState<ServiceStatus>("idle");
  const [analysisServiceStatus, setAnalysisServiceStatus] =
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

  useEffect(() => {
    checkMainBackendStatus();
    checkAnalysisServiceStatus();
  }, []);

  const StatusBadge = ({ status }: { status: ServiceStatus }) => {
    switch (status) {
      case "online":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            {t("admin.status.online")}
          </Badge>
        );
      case "offline":
        return <Badge variant="destructive">{t("admin.status.offline")}</Badge>;
      case "checking":
        return <Badge variant="secondary">{t("admin.status.checking")}</Badge>;
      default:
        return <Badge variant="outline">{t("admin.status.idle")}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 hidden sm:block text-red-500" />
          {t("admin.status.title")}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {t("admin.status.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <p className="text-xs text-muted-foreground pt-2">
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
            <p className="text-xs text-muted-foreground pt-2">
              {t("admin.status.wakeUpDescription")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatusTabContent;
