import { randomUUID } from "crypto";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

let supabaseClient: any = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("SUPABASE_URL or SUPABASE_ANON_KEY missing. Supabase Storage disabled.");
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient('https://dummy.supabase.co', 'dummy');
    return supabaseClient;
  }
  const { createClient } = require('@supabase/supabase-js');
  supabaseClient = createClient(url, key);
  return supabaseClient;
}

export class ObjectStorageService {
  constructor() {}

  async getObjectEntityUploadURL(): Promise<{
    uploadURL: string;
    token?: string;
    objectId: string;
    objectPath: string;
    videoUrl: string;
  }> {
    const supabase = getSupabase();
    const objectId = randomUUID();
    const filePath = `uploads/${objectId}`;

    const { data, error } = await supabase.storage.from('videos').createSignedUploadUrl(filePath);

    if (error || !data) {
      throw new Error(`Supabase error: ${error?.message || 'Unknown'}`);
    }

    let uploadURL = data.signedUrl;
    if (uploadURL.startsWith('/')) {
        uploadURL = `${process.env.SUPABASE_URL}/storage/v1${uploadURL}`;
    }

    const objectPath = `/objects/uploads/${objectId}`;
    const videoUrl = `/api/storage/objects/uploads/${objectId}`;

    return { uploadURL, token: data.token, objectId, objectPath, videoUrl };
  }

  async getObjectEntitySignedReadURL(objectPath: string, ttlSec = 3600): Promise<string> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) throw new ObjectNotFoundError();

    const filePath = parts.slice(1).join("/");
    const supabase = getSupabase();

    const { data, error } = await supabase.storage.from('videos').createSignedUrl(filePath, ttlSec);

    if (error || !data) {
      throw new ObjectNotFoundError();
    }

    return data.signedUrl;
  }

  async configureBucketCors(): Promise<void> {
    console.log("Supabase bucket CORS should be configured in the Supabase Dashboard.");
  }
  
  // Stubs for legacy routes
  async searchPublicObject(filePath: string): Promise<any | null> {
    return null;
  }
  
  async downloadObject(file: any): Promise<Response> {
    return new Response(null, { status: 404 });
  }

  // Stubs for legacy chunked uploads (no longer used, replaced by direct PUT)
  async startChunkedUpload(contentType: string, totalSize: number): Promise<any> {
    throw new Error("Deprecated");
  }
  async uploadChunk(sessionId: string, chunk: Buffer, start: number): Promise<any> {
    throw new Error("Deprecated");
  }
  async getUploadWriteStream(contentType: string): Promise<any> {
    throw new Error("Deprecated");
  }
}
