import { useState, useCallback } from "react";

interface UploadResult {
  objectPath: string;
  videoUrl: string;
}

interface UseVideoUploadOptions {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
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

        const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
        const contentType = file.type || "video/mp4";

        // Step 1: Request a signed upload URL from our backend
        const reqRes = await fetch(`${base}/api/storage/uploads/request-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: file.name, contentType, size: file.size }),
        });

        if (!reqRes.ok) {
          const err = await reqRes.json().catch(() => ({}));
          throw new Error(err.error || "Impossible de démarrer l'upload");
        }

        const { uploadURL, objectPath, videoUrl } = await reqRes.json();
        setProgress(10);

        // Step 2: Upload directly to R2 using standard XMLHttpRequest for progress tracking
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadURL, true);
          xhr.setRequestHeader("Content-Type", contentType);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const pct = Math.round((event.loaded / event.total) * 85) + 10;
              setProgress(pct);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.responseText);
            } else {
              reject(new Error(`Upload échoué: ${xhr.status} ${xhr.responseText}`));
            }
          };

          xhr.onerror = () => reject(new Error("Erreur réseau pendant l'upload"));
          xhr.send(file);
        });

        setProgress(100);
        const result = { objectPath, videoUrl };
        options.onSuccess?.(result);
        return result;
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
