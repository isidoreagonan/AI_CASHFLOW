import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { objectStorageService } from "../lib/objectStorage";
import { adminMiddleware } from "../lib/auth";

const RequestUploadUrlBody = z.object({
  name: z.string(),
  size: z.number().optional(),
  contentType: z.string().optional(),
});

const router: IRouter = Router();

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload to Cloudflare R2.
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

export default router;

