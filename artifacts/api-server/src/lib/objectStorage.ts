import { Storage, File } from "@google-cloud/storage";
import { Readable, type Writable } from "stream";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

interface UploadSession {
  resumableUri: string;
  objectId: string;
  objectPath: string;
  videoUrl: string;
  uploadedBytes: number;
  totalSize: number;
  createdAt: number;
}

const uploadSessions = new Map<string, UploadSession>();

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {}

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          "tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;

      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }

    return null;
  }

  async downloadObject(file: File, cacheTtlSec: number = 3600): Promise<Response> {
    const [metadata] = await file.getMetadata();
    const aclPolicy = await getObjectAclPolicy(file);
    const isPublic = aclPolicy?.visibility === "public";

    const nodeStream = file.createReadStream();
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    const headers: Record<string, string> = {
      "Content-Type": (metadata.contentType as string) || "application/octet-stream",
      "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
    };
    if (metadata.size) {
      headers["Content-Length"] = String(metadata.size);
    }

    return new Response(webStream, { headers });
  }

  async getObjectEntityUploadURL(): Promise<{
    uploadURL: string;
    objectId: string;
    objectPath: string;
    videoUrl: string;
  }> {
    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }

    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    const uploadURL = await signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 3600, // 1 hour for large files
    });

    const objectPath = `/objects/uploads/${objectId}`;
    const videoUrl = `/api/storage/objects/uploads/${objectId}`;

    return { uploadURL, objectId, objectPath, videoUrl };
  }

  /**
   * Configure CORS on the GCS bucket so mobile browsers can PUT directly
   * to signed URLs without a CORS preflight failure.
   */
  async configureBucketCors(): Promise<void> {
    try {
      const privateObjectDir = this.getPrivateObjectDir();
      const { bucketName } = parseObjectPath(`${privateObjectDir}/placeholder`);
      const bucket = objectStorageClient.bucket(bucketName);
      await bucket.setCorsConfiguration([{
        origin: ["*"],
        method: ["GET", "PUT", "OPTIONS", "HEAD"],
        responseHeader: [
          "Content-Type",
          "Authorization",
          "Content-Length",
          "Origin",
          "X-Requested-With",
          "X-Goog-SignedHeaders",
          "X-Goog-Algorithm",
          "X-Goog-Credential",
          "X-Goog-Date",
          "X-Goog-Expires",
          "X-Goog-Signature",
        ],
        maxAgeSeconds: 3600,
      }]);
      console.log("GCS bucket CORS configured");
    } catch (err: any) {
      console.warn("Could not configure GCS CORS (non-fatal):", err?.message);
    }
  }

  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }

  /**
   * Start a chunked upload session for a large file.
   * Returns a sessionId the client uses for subsequent chunk calls.
   * All chunks are assembled server-side via a GCS resumable upload,
   * so each individual POST stays small (1-3 MB) and never hits the proxy limit.
   */
  async startChunkedUpload(contentType: string, totalSize: number): Promise<{
    sessionId: string;
    objectId: string;
    objectPath: string;
    videoUrl: string;
  }> {
    const privateObjectDir = this.getPrivateObjectDir();
    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);

    // Initiate a GCS resumable upload session
    const [resumableUri] = await file.createResumableUpload({
      metadata: { contentType, name: objectName },
    });

    const sessionId = randomUUID();
    const objectPath = `/objects/uploads/${objectId}`;
    const videoUrl = `/api/storage/objects/uploads/${objectId}`;

    uploadSessions.set(sessionId, {
      resumableUri,
      objectId,
      objectPath,
      videoUrl,
      uploadedBytes: 0,
      totalSize,
      createdAt: Date.now(),
    });

    // Clean up stale sessions (older than 3 hours)
    const staleThreshold = Date.now() - 3 * 60 * 60 * 1000;
    for (const [id, session] of uploadSessions.entries()) {
      if (session.createdAt < staleThreshold) uploadSessions.delete(id);
    }

    return { sessionId, objectId, objectPath, videoUrl };
  }

  /**
   * Upload a single chunk to an existing GCS resumable session.
   * The chunk is a Buffer containing the raw bytes for the range [start, end].
   * When the last chunk is uploaded (start + chunk.length === totalSize), GCS finalises the object.
   */
  async uploadChunk(sessionId: string, chunk: Buffer, start: number): Promise<{
    uploadedBytes: number;
    done: boolean;
    objectPath?: string;
    videoUrl?: string;
  }> {
    const session = uploadSessions.get(sessionId);
    if (!session) throw new Error("Session introuvable ou expirée — recommencer l'upload");

    const end = start + chunk.length - 1;
    const totalSize = session.totalSize;
    const isLast = end + 1 >= totalSize;

    // Content-Range: bytes start-end/totalSize  (or */totalSize for query)
    const contentRange = `bytes ${start}-${end}/${totalSize}`;

    const response = await fetch(session.resumableUri, {
      method: "PUT",
      headers: {
        "Content-Length": String(chunk.length),
        "Content-Range": contentRange,
      },
      body: chunk,
    });

    // GCS returns 308 for intermediate chunks, 200/201 for the final chunk
    if (!response.ok && response.status !== 308) {
      const body = await response.text().catch(() => "");
      throw new Error(`GCS chunk upload failed (${response.status}): ${body.slice(0, 200)}`);
    }

    session.uploadedBytes = end + 1;

    if (isLast) {
      uploadSessions.delete(sessionId);
      return { uploadedBytes: totalSize, done: true, objectPath: session.objectPath, videoUrl: session.videoUrl };
    }

    return { uploadedBytes: session.uploadedBytes, done: false };
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }

    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;

    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }

    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }

    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  async getObjectEntitySignedReadURL(objectPath: string, ttlSec = 3600): Promise<string> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) throw new ObjectNotFoundError();

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) entityDir = `${entityDir}/`;
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);

    // Verify the object exists first
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) throw new ObjectNotFoundError();

    return signObjectURL({ bucketName, objectName, method: "GET", ttlSec });
  }

  async getUploadWriteStream(contentType: string): Promise<{ objectId: string; stream: Writable }> {
    const objectId = randomUUID();
    const privateObjectDir = this.getPrivateObjectDir();
    const { bucketName, objectName } = parseObjectPath(`${privateObjectDir}/uploads/${objectId}`);
    const file = objectStorageClient.bucket(bucketName).file(objectName);
    const stream = file.createWriteStream({
      resumable: true, // Required for files > 5MB (all phone videos)
      metadata: { contentType: contentType || "video/mp4" },
      timeout: 3600000, // 60 minutes
    });
    return { objectId, stream };
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: File;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30_000),
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit`
    );
  }

  const { signed_url: signedURL } = await response.json() as { signed_url: string };
  return signedURL;
}
