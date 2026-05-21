import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useMusicStore } from "./useMusicStore";

export type UploadStatus =
  | "PENDING"
  | "UPLOADING"
  | "PROCESSING"
  | "SUCCESS"
  | "ERROR";

export interface UploadTask {
  id: string;
  spotifyUrl: string;
  fileName: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

interface UploadStore {
  tasks: UploadTask[];
  addTask: (spotifyUrl: string, file: File) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  tasks: [],
  addTask: async (spotifyUrl, file) => {
    const taskId = uuidv4();

    // Добавляем задачу в очередь со статусом PENDING
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          id: taskId,
          spotifyUrl,
          fileName: file.name,
          progress: 0,
          status: "PENDING",
        },
      ],
    }));

    try {
      const chunkSize = 50 * 1024 * 1024; // 50 МБ
      const totalChunks = Math.ceil(file.size / chunkSize);
      const uploadId = uuidv4();

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: "UPLOADING" } : t,
        ),
      }));

      // 1. ОТПРАВКА ЧАНКОВ
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const chunkData = new FormData();
        chunkData.append("chunk", chunk);
        chunkData.append("uploadId", uploadId);
        chunkData.append("chunkIndex", (i + 1).toString());
        chunkData.append("totalChunks", totalChunks.toString());

        await axiosInstance.post("/admin/albums/upload-chunk", chunkData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const currentChunkProgress =
              progressEvent.loaded / (progressEvent.total || 1);
            const overallProgress = Math.round(
              ((i + currentChunkProgress) / totalChunks) * 100,
            );

            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId ? { ...t, progress: overallProgress } : t,
              ),
            }));
          },
        });
      }

      // 2. ФИНАЛЬНЫЙ ЗАПРОС (ОБРАБОТКА НА БЭКЕНДЕ)
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: "PROCESSING", progress: 100 } : t,
        ),
      }));

      await axiosInstance.post("/admin/albums/upload-full-album", {
        spotifyAlbumUrl: spotifyUrl,
        uploadId: uploadId,
      });

      // УСПЕХ
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: "SUCCESS" } : t,
        ),
      }));

      toast.success(`Альбом успешно загружен!`);
      // Обновляем список альбомов
      useMusicStore.getState().fetchAlbums();
    } catch (error: any) {
      console.error("Task Upload Error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: "ERROR", error: errorMessage } : t,
        ),
      }));
      toast.error(`Ошибка загрузки: ${errorMessage}`);
    }
  },
  removeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },
  clearCompleted: () => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.status !== "SUCCESS"),
    }));
  },
}));
