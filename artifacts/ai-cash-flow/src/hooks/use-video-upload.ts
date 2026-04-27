import { useState, useCallback } from "react";

interface UploadResult {
  objectPath: string;
  videoUrl: string;
}

interface UseVideoUploadOptions {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

// Each chunk is sent as a separate small POST request — bypasses Replit proxy body-size limit
const CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB — well below the proxy limit
const MAX_RETRIES = 3;

async function sendChunk(
  base: string,
  token: string,
  sessionId: string,
  chunk: ArrayBuffer,
  start: number,
  retries = MAX_RETRIES
): Promise<{ done: boolean; objectPath?: string; videoUrl?: string; uploadedBytes: number }> {
  const attempt = async () => {
    const response = await fetch(`${base}/api/storage/upload/chunk/${sessionId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
        "X-Chunk-Start": String(start),
        "Content-Length": String(chunk.byteLength),
      },
      body: chunk,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Erreur serveur chunk (${response.status})`);
    }
    return response.json();
  };

  for (let i = 0; i < retries; i++) {
    try {
      return await attempt();
    } catch (err) {
      if (i === retries - 1) throw err;
      // Wait before retry: 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
    }
  }
  throw new Error("Toutes les tentatives ont échoué");
}

export function useVideoUpload(options: UseVideoUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadVideo = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(2);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Non authentifié");

        const base = (import.meta.env.BASE_URL ?? "").replace(/\/$/, "");
        const contentType = file.type || "video/mp4";

        // Step 1 — Start the upload session (tiny JSON request, no size issue)
        const startRes = await fetch(`${base}/api/storage/upload/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ contentType, totalSize: file.size }),
        });

        if (!startRes.ok) {
          const err = await startRes.json().catch(() => ({}));
          throw new Error(err.error || "Impossible de démarrer l'upload");
        }

        const { sessionId, objectPath, videoUrl } = await startRes.json();
        setProgress(5);

        // Step 2 — Send the file in 2 MB chunks using file.slice() to avoid
        // loading the entire file into memory (critical for large videos on mobile)
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        let finalResult: UploadResult | null = null;

        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          // .slice() returns a Blob — no memory spike, only this chunk is loaded
          const chunk = await file.slice(start, end).arrayBuffer();

          const result = await sendChunk(base, token, sessionId, chunk, start);

          const pct = Math.round(((i + 1) / totalChunks) * 90) + 5;
          setProgress(Math.min(pct, 95));

          if (result.done) {
            finalResult = {
              objectPath: result.objectPath ?? objectPath,
              videoUrl: result.videoUrl ?? videoUrl,
            };
          }
        }

        setProgress(100);
        const resultToReturn = finalResult ?? { objectPath, videoUrl };
        options.onSuccess?.(resultToReturn);
        return resultToReturn;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error("Upload échoué");
        setError(uploadError);
        options.onError?.(uploadError);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  return { uploadVideo, isUploading, progress, error };
}
