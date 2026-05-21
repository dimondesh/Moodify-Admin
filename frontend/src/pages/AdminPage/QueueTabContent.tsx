import { useEffect, useState } from "react";
import {
  ListOrdered,
  ServerCog,
  HardDrive,
  FileStack,
  XCircle,
  CheckCircle2,
  Loader2,
  Link2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Button } from "../../components/ui/button";
import { axiosInstance } from "../../lib/axios";
import { useUploadStore } from "../../stores/useUploadStore";

interface QueueStatus {
  fileJobQueue: { waitingCount: number; busy: boolean };
  globalLease: { activeCount: number };
  chunkedZipSessions: { sessions: number; uploadIds: string[] };
}

const QueueTabContent = () => {
  const [status, setStatus] = useState<QueueStatus | null>(null);

  // Получаем таски из нашего нового Zustand стора
  const { tasks, removeTask, clearCompleted } = useUploadStore();

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const response = await axiosInstance.get("/admin/upload-queue/status");
        setStatus(response.data);
      } catch (error) {
        console.error("Failed to fetch queue status:", error);
      }
    };

    fetchQueueStatus();
    const interval = setInterval(fetchQueueStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <ListOrdered className="h-5 w-5 hidden sm:block text-blue-500" />
          Очередь загрузок
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Фоновые загрузки альбомов из Spotify и статистика бэкенда.
        </p>
      </div>

      {/* Секция 1: Локальная очередь (фронтенд-задачи) */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">
            Активные задачи загрузки
          </CardTitle>
          {tasks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompleted}
              className="text-zinc-400 hover:text-white"
            >
              Очистить завершенные
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center text-zinc-500 py-6 text-sm">
              Очередь пуста. Нажмите "From Spotify" во вкладке Albums, чтобы
              добавить альбомы.
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-black/30 border border-[#2a2a2a] p-4 rounded-lg flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Link2 className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-[400px]">
                        {task.spotifyUrl}
                      </span>
                      <span className="text-xs text-zinc-500 truncate hidden sm:inline-block">
                        ({task.fileName})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {task.status === "PENDING" && (
                        <Badge variant="outline" className="text-zinc-400">
                          В очереди
                        </Badge>
                      )}
                      {task.status === "UPLOADING" && (
                        <Badge className="bg-blue-500">
                          Загрузка файлов...
                        </Badge>
                      )}
                      {task.status === "PROCESSING" && (
                        <Badge className="bg-orange-500">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />{" "}
                          Обработка
                        </Badge>
                      )}
                      {task.status === "SUCCESS" && (
                        <Badge className="bg-emerald-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Готово
                        </Badge>
                      )}
                      {task.status === "ERROR" && (
                        <Badge className="bg-red-500">
                          <XCircle className="h-3 w-3 mr-1" /> Ошибка
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-zinc-500 hover:text-red-400"
                        onClick={() => removeTask(task.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Прогресс-бар для состояния загрузки */}
                  {(task.status === "UPLOADING" ||
                    task.status === "PROCESSING" ||
                    task.status === "SUCCESS") && (
                    <div className="flex flex-col gap-1">
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${task.status === "SUCCESS" ? "bg-emerald-500" : "bg-violet-500"}`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      {task.status === "UPLOADING" && (
                        <span className="text-[10px] text-zinc-500 text-right">
                          {task.progress}%
                        </span>
                      )}
                    </div>
                  )}

                  {/* Вывод ошибки */}
                  {task.status === "ERROR" && task.error && (
                    <div className="text-xs text-red-400 bg-red-400/10 p-2 rounded-md">
                      {task.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Секция 2: Статистика Бэкенда */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Очередь бэкенда
              </CardTitle>
              <ServerCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                {status.fileJobQueue.busy ? (
                  <Badge className="bg-red-500 hover:bg-red-600">Busy</Badge>
                ) : (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Idle
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Задач в ожидании:{" "}
                <span className="text-white font-medium">
                  {status.fileJobQueue.waitingCount}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Глобальные блокировки
              </CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {status.globalLease.activeCount}
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                активных процессов загрузки
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Сессии чанков
              </CardTitle>
              <FileStack className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white mb-2">
                {status.chunkedZipSessions.sessions}
              </div>
              <ScrollArea className="h-[60px] w-full rounded-md border border-[#2a2a2a] p-2 bg-black/20">
                {status.chunkedZipSessions.uploadIds.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {status.chunkedZipSessions.uploadIds.map((id) => (
                      <span
                        key={id}
                        className="text-xs text-zinc-400 font-mono truncate"
                      >
                        {id}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-500">
                    Нет активных сессий
                  </span>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QueueTabContent;
