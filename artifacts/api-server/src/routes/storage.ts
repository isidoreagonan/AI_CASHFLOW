import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { z } from "zod";
import Busboy from "busboy";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import { adminMiddleware } from "../lib/auth";

const RequestUploadUrlBody = z.object({
  name: z.string(),
  size: z.number().optional(),
  contentType: z.string().optional(),
});

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload.
 * The client sends JSON metadata (name, size, contentType) — NOT the file.
 * Then uploads the file directly to the returned presigned URL.
 */
router.post("/storage/uploads/request-url", adminMiddleware, async (req: Request, res: Response) => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }

  try {
    const { name, size, contentType } = parsed.data;
    const { uploadURL, objectId, objectPath, videoUrl } = await objectStorageService.getObjectEntityUploadURL(contentType);

    res.json({ uploadURL, objectId, objectPath, videoUrl, metadata: { name, size, contentType } });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

/**
 * POST /storage/upload/start
 *
 * Admin-only: Start a chunked upload session.
 * Creates a GCS resumable upload session; client then PUTs small chunks
 * through the server, each staying well below the proxy body limit.
 * Body: { contentType, totalSize }
 * Response: { sessionId, objectId, objectPath, videoUrl }
 */
router.post("/storage/upload/start", adminMiddleware, async (req: Request, res: Response) => {
  const { contentType, totalSize } = req.body || {};
  if (!contentType || typeof totalSize !== "number" || totalSize <= 0) {
    res.status(400).json({ error: "contentType et totalSize (number) requis" });
    return;
  }
  try {
    const result = await objectStorageService.startChunkedUpload(contentType, totalSize);
    res.json(result);
  } catch (err: any) {
    console.error("startChunkedUpload error:", err);
    res.status(500).json({ error: err.message || "Impossible de démarrer l'upload" });
  }
});

/**
 * POST /storage/upload/chunk/:sessionId
 *
 * Admin-only: Upload one chunk of data.
 * Body: raw binary (Content-Type: application/octet-stream), ~2 MB per request.
 * Headers:
 *   X-Chunk-Start  — byte offset of this chunk in the final file
 *   Content-Length — size of this chunk in bytes
 * Response: { uploadedBytes, done } or { uploadedBytes, done, objectPath, videoUrl } on last chunk.
 */
router.post("/storage/upload/chunk/:sessionId", adminMiddleware, (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const chunkStart = parseInt(String(req.headers["x-chunk-start"] ?? "0"), 10);

  const chunks: Buffer[] = [];
  req.on("data", (chunk: Buffer) => chunks.push(chunk));
  req.on("error", (err) => {
    console.error("Chunk read error:", err);
    res.status(500).json({ error: "Erreur de lecture du chunk" });
  });
  req.on("end", async () => {
    try {
      const buffer = Buffer.concat(chunks);
      const result = await objectStorageService.uploadChunk(sessionId, buffer, chunkStart);
      res.json(result);
    } catch (err: any) {
      console.error("uploadChunk error:", err);
      res.status(500).json({ error: err.message || "Erreur upload chunk" });
    }
  });
});

/**
 * POST /storage/direct-upload
 *
 * Admin-only: Upload a video/audio file directly via the API server (multipart/form-data).
 * This bypasses presigned URLs, solving CORS issues on mobile browsers.
 * Field name: "file"
 */
router.post("/storage/direct-upload", adminMiddleware, (req: Request, res: Response) => {
  let responded = false;
  let gcsStreamRef: NodeJS.WritableStream | null = null;

  const respond = (status: number, body: object) => {
    if (!responded) {
      responded = true;
      res.status(status).json(body);
    }
  };

  // Set a generous timeout for large video uploads (60 min)
  req.setTimeout(3600000);
  res.setTimeout(3600000);

  const bb = Busboy({
    headers: req.headers,
    limits: { fileSize: 4 * 1024 * 1024 * 1024 }, // 4 GB
  });

  bb.on("file", (_fieldname: string, fileStream: NodeJS.ReadableStream, info: { filename: string; encoding: string; mimeType: string }) => {
    // Infer content type — iOS often sends empty mimeType
    const ext = (info.filename || "").split(".").pop()?.toLowerCase() ?? "";
    const mimeMap: Record<string, string> = {
      mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
      mkv: "video/x-matroska", avi: "video/x-msvideo", m4v: "video/mp4",
      mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
      m4a: "audio/mp4", aac: "audio/aac", flac: "audio/flac",
    };
    const contentType = info.mimeType || mimeMap[ext] || "video/mp4";

    objectStorageService.getUploadWriteStream(contentType).then(({ objectId, stream }) => {
      gcsStreamRef = stream;
      (fileStream as NodeJS.ReadableStream).pipe(stream);

      stream.on("finish", () => {
        const objectPath = `/objects/uploads/${objectId}`;
        const videoUrl = `/api/storage/objects/uploads/${objectId}`;
        respond(200, { objectPath, videoUrl });
      });

      stream.on("error", (err: Error) => {
        console.error("GCS write stream error:", err.message);
        respond(500, { error: `Erreur GCS : ${err.message}` });
      });

      fileStream.on("error", (err: Error) => {
        console.error("File read stream error:", err.message);
        respond(500, { error: "Erreur de lecture du fichier" });
      });

      (fileStream as any).on("limit", () => {
        console.warn("File size limit reached");
        respond(413, { error: "Fichier trop volumineux (max 4 Go)" });
      });
    }).catch((err: Error) => {
      console.error("Failed to init GCS upload stream:", err.message);
      respond(500, { error: `Impossible d'initialiser l'upload : ${err.message}` });
    });
  });

  bb.on("finish", () => {
    // Busboy parsed everything — GCS stream should finish shortly after
    // If no file was received, respond with an error
    if (!gcsStreamRef && !responded) {
      respond(400, { error: "Aucun fichier reçu dans la requête" });
    }
  });

  bb.on("error", (err: Error) => {
    console.error("Busboy parsing error:", err.message);
    respond(400, { error: `Erreur de parsing : ${err.message}` });
  });

  req.on("error", (err: Error) => {
    console.error("Request stream error:", err.message);
    respond(500, { error: "Connexion interrompue pendant l'upload" });
  });

  req.pipe(bb);
});

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * These are unconditionally public — no authentication or ACL checks.
 * IMPORTANT: Always provide this endpoint when object storage is set up.
 */
router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const response = await objectStorageService.downloadObject(file);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Error serving public object:", error);
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

/**
 * GET /storage/objects/*
 *
 * Serve object entities from PRIVATE_OBJECT_DIR.
 * Generates a short-lived GCS signed URL and redirects the client to it.
 * GCS handles range requests natively — ideal for video/audio on mobile.
 */
router.get("/storage/objects/*path", async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;

    const signedUrl = await objectStorageService.getObjectEntitySignedReadURL(objectPath, 3600);

    // Redirect the client directly to GCS — handles range requests natively
    res.setHeader("Cache-Control", "private, no-store");
    res.redirect(302, signedUrl);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      console.warn("Object not found:", error);
      res.status(404).json({ error: "Object not found" });
      return;
    }
    console.error("Error serving object:", error);
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
