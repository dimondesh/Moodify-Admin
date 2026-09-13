import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { axiosInstance } from "./axios";

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 30 * 60 * 1000;
const CHUNK_SIZE = 50 * 1024 * 1024;

export const UploadJobStatus = {
  Completed: "completed",
  Failed: "failed",
  Pending: "pending",
  Processing: "processing",
  Queued: "queued",
} as const;

export type UploadJobStatus =
  (typeof UploadJobStatus)[keyof typeof UploadJobStatus];

export interface UploadJobResponse {
  status: UploadJobStatus | string;
  message?: string;
  jobId?: string;
}

export type IngestProgress = {
  onUploadProgress?: (percent: number) => void;
  onStatus?: (message: string) => void;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function getApiErrorMessage(error: unknown, fallback = "Unknown error"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

async function pollUploadJob(
  jobId: string,
  onStatus?: (message: string) => void,
): Promise<UploadJobResponse> {
  const started = Date.now();
  while (Date.now() - started < POLL_TIMEOUT_MS) {
    const { data } = await axiosInstance.get<UploadJobResponse>(
      `/admin/albums/upload-jobs/${jobId}`,
    );
    if (data.status === UploadJobStatus.Completed) return data;
    if (data.status === UploadJobStatus.Failed) {
      throw new Error(data.message || "Album ingest failed.");
    }
    onStatus?.(data.message || "Processing album...");
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error("Timed out waiting for album ingest job.");
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

/** ponytail: O(n) chunk loop + poll; fine for admin ingest; upgrade if multi-file batching needed */
export async function ingestAlbumFromSpotify(
  spotifyAlbumUrl: string,
  zipFile: File | null,
  { onUploadProgress, onStatus }: IngestProgress = {},
): Promise<void> {
  if (zipFile) {
    const totalChunks = Math.ceil(zipFile.size / CHUNK_SIZE);
    onStatus?.(`Uploading file in ${totalChunks} parts...`);
    const uploadId = await uploadZipChunks(zipFile, onUploadProgress);
    onStatus?.(
      "Processing album on server (this may take a few minutes)...",
    );
    onUploadProgress?.(100);
    await axiosInstance.post("/admin/albums/upload-full-album", {
      spotifyAlbumUrl,
      uploadId,
    });
    return;
  }

  onStatus?.("Queuing album download...");
  const { data } = await axiosInstance.post<{ jobId?: string }>(
    "/admin/albums/upload-from-url",
    { spotifyAlbumUrl },
  );
  if (!data.jobId) {
    throw new Error("No jobId returned from server.");
  }
  onStatus?.("Downloading via deemix...");
  onUploadProgress?.(50);
  await pollUploadJob(data.jobId, onStatus);
  onUploadProgress?.(100);
}
