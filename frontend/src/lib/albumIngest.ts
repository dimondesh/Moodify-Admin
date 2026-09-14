import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { axiosInstance } from "./axios";
import type { Album } from "../types";

const CHUNK_SIZE = 50 * 1024 * 1024;

export type IngestProgress = {
  onUploadProgress?: (percent: number) => void;
  onStatus?: (message: string) => void;
};

export function getApiErrorMessage(error: unknown, fallback = "Unknown error"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

async function uploadZipChunks(
  file: File,
  onUploadProgress?: (percent: number) => void,
): Promise<string> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = uuidv4();

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
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
        onUploadProgress?.(
          Math.round(((i + currentChunkProgress) / totalChunks) * 100),
        );
      },
    });
  }

  return uploadId;
}

export type EnqueueAlbumResult = {
  jobId?: string;
  album?: Album;
  message?: string;
};

/** Enqueue Spotify album ingest (URL and/or ZIP). Returns immediately after queueing. */
export async function ingestAlbumFromSpotify(
  spotifyAlbumUrl: string,
  zipFile: File | null,
  { onUploadProgress, onStatus }: IngestProgress = {},
): Promise<EnqueueAlbumResult> {
  if (zipFile) {
    const totalChunks = Math.ceil(zipFile.size / CHUNK_SIZE);
    onStatus?.(`Uploading file in ${totalChunks} parts...`);
    const uploadId = await uploadZipChunks(zipFile, onUploadProgress);
    onStatus?.("Queuing album...");
    onUploadProgress?.(100);
    const { data } = await axiosInstance.post<EnqueueAlbumResult>(
      "/admin/albums/upload-full-album",
      { spotifyAlbumUrl, uploadId },
    );
    return data;
  }

  onStatus?.("Queuing album download...");
  const { data } = await axiosInstance.post<EnqueueAlbumResult>(
    "/admin/albums/upload-from-url",
    { spotifyAlbumUrl },
  );
  return data;
}

export async function cancelAlbumUpload(albumId: string): Promise<void> {
  await axiosInstance.post(`/admin/albums/${albumId}/cancel-upload`);
}
