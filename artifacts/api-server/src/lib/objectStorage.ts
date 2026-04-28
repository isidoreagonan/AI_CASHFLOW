import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class ObjectStorageService {
  private s3Client: S3Client | null = null;
  private bucketName: string = "";
  private publicDomain: string = "";

  constructor() {
    this.init();
  }

  private init() {
    const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
    const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
    const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();
    this.bucketName = (process.env.R2_BUCKET_NAME || "videos").trim();
    this.publicDomain = (process.env.R2_PUBLIC_DOMAIN || "").trim();

    if (accountId && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      console.log("Cloudflare R2 Object Storage initialized successfully.");
    } else {
      console.warn("Cloudflare R2 Object Storage credentials missing. Videos will not work.");
    }
  }

  /**
   * Retourne une URL pré-signée pour permettre l'upload depuis le frontend
   */
  async getObjectEntityUploadURL(contentType: string = "video/mp4"): Promise<{ uploadURL: string, objectId: string, objectPath: string, videoUrl: string }> {
    if (!this.s3Client) {
      throw new Error("S3 Client not initialized. Please check R2 environment variables.");
    }

    const objectId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const objectPath = `${objectId}.mp4`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectPath,
      ContentType: contentType,
    });

    // Generate a signed URL that expires in 1 hour
    const uploadURL = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    
    // Format public domain URL properly
    const cleanDomain = this.publicDomain.replace(/\/$/, "");
    const videoUrl = `${cleanDomain}/${objectPath}`;

    return { uploadURL, objectId, objectPath, videoUrl };
  }

  /**
   * Retourne une URL de lecture pré-signée (si le bucket n'est pas public)
   */
  async getObjectSignedReadURL(objectPath: string): Promise<string> {
    if (!this.s3Client) {
      throw new Error("S3 Client not initialized.");
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objectPath,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  /**
   * Supprime un objet du stockage
   */
  async deleteObject(objectPath: string): Promise<void> {
    if (!this.s3Client) {
      throw new Error("S3 Client not initialized.");
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: objectPath,
    });

    await this.s3Client.send(command);
  }

  // ===== Legacy methods kept for backward compatibility and type safety =====
  async getUploadWriteStream(contentType: string, totalSize: number): Promise<any> {
    throw new Error("Deprecated: Use getObjectEntityUploadURL for direct R2 uploads.");
  }

  async startChunkedUpload(contentType: string, totalSize: number): Promise<any> {
    throw new Error("Deprecated: Use direct upload with R2 signed URLs.");
  }

  async uploadChunk(uploadId: string, chunkNumber: number, chunkData: Buffer): Promise<any> {
    throw new Error("Deprecated.");
  }

  async completeChunkedUpload(uploadId: string): Promise<any> {
    throw new Error("Deprecated.");
  }
}

export const objectStorageService = new ObjectStorageService();
