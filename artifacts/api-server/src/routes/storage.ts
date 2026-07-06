import { Router, type IRouter, type Request, type Response } from "express";
import fs, { createReadStream } from "fs";
import { Readable } from "stream";
import {
  RequestUploadUrlBody,
  RequestUploadUrlResponse,
} from "@workspace/api-zod";
import {
  ObjectStorageService,
  ObjectNotFoundError,
  IS_REPLIT_ENVIRONMENT,
} from "../lib/objectStorage";
import {
  LocalObjectStorageService,
  LocalObjectNotFoundError,
  verifyUploadToken,
} from "../lib/objectStorageLocal";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();
const localObjectStorageService = new LocalObjectStorageService();

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload.
 * The client sends JSON metadata (name, size, contentType) — NOT the file.
 * Then uploads the file directly to the returned presigned URL.
 * Restricted to authenticated admins since this is only used from the admin panel.
 *
 * On Replit, this returns a signed GCS URL via the Object Storage sidecar.
 * Everywhere else (Coolify, any other Docker host), it returns a same-origin
 * URL backed by local disk storage, signed with a short-lived upload token.
 */
router.post("/storage/uploads/request-url", requireAuth, async (req: Request, res: Response) => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }

  try {
    const { name, size, contentType } = parsed.data;

    if (IS_REPLIT_ENVIRONMENT) {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      res.json(
        RequestUploadUrlResponse.parse({
          uploadURL,
          objectPath,
          metadata: { name, size, contentType },
        }),
      );
      return;
    }

    const appBaseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const { uploadURL, objectPath } = await localObjectStorageService.getObjectEntityUploadURL(appBaseUrl);
    res.json(
      RequestUploadUrlResponse.parse({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Error generating upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

/**
 * PUT /storage/local-uploads/:objectId
 *
 * Receives the actual file bytes for the local-disk storage driver. Only used
 * when NOT running on Replit. Authorized via a short-lived signed token
 * (query param `token`) issued by /storage/uploads/request-url, since the
 * client uploads directly to this URL without sending admin session cookies.
 */
router.put("/storage/local-uploads/:objectId", async (req: Request, res: Response) => {
  const rawObjectId = req.params.objectId;
  const objectId = Array.isArray(rawObjectId) ? rawObjectId[0] : rawObjectId;
  const token = typeof req.query.token === "string" ? req.query.token : "";

  if (!objectId || !token || !verifyUploadToken(token, objectId)) {
    res.status(401).json({ error: "Invalid or expired upload token" });
    return;
  }

  try {
    await localObjectStorageService.writeUpload(objectId, req);
    res.status(200).json({ objectPath: `/objects/uploads/${objectId}` });
  } catch (error) {
    req.log.error({ err: error }, "Error writing local upload");
    res.status(500).json({ error: "Failed to store uploaded file" });
  }
});

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * These are unconditionally public — no authentication or ACL checks.
 * Replit driver only; the local driver serves everything through
 * /storage/objects/* instead.
 */
router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  if (!IS_REPLIT_ENVIRONMENT) {
    res.status(404).json({ error: "File not found" });
    return;
  }

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
    req.log.error({ err: error }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

/**
 * GET /storage/objects/*
 *
 * Serve object entities. On Replit, from PRIVATE_OBJECT_DIR via the sidecar.
 * Everywhere else, directly from local disk.
 */
router.get("/storage/objects/*path", async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;

    if (!IS_REPLIT_ENVIRONMENT) {
      const filePath = await localObjectStorageService.getObjectEntityFilePath(objectPath);
      const stat = fs.statSync(filePath);
      res.setHeader("Content-Length", String(stat.size));
      res.setHeader("Cache-Control", "private, max-age=3600");
      createReadStream(filePath).pipe(res);
      return;
    }

    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError || error instanceof LocalObjectNotFoundError) {
      req.log.warn({ err: error }, "Object not found");
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
