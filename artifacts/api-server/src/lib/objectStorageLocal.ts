import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be set. Did you forget to configure it?");
}

const UPLOAD_TOKEN_TTL_SECONDS = 15 * 60; // matches signed-URL TTL used by the Replit driver

export const LOCAL_STORAGE_ROOT = path.resolve(
  process.env.LOCAL_STORAGE_DIR || path.join(process.cwd(), "data", "uploads"),
);

export class LocalObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "LocalObjectNotFoundError";
    Object.setPrototypeOf(this, LocalObjectNotFoundError.prototype);
  }
}

interface UploadTokenPayload {
  objectId: string;
  purpose: "object-upload";
}

function signUploadToken(objectId: string): string {
  return jwt.sign({ objectId, purpose: "object-upload" } as UploadTokenPayload, JWT_SECRET as string, {
    expiresIn: UPLOAD_TOKEN_TTL_SECONDS,
  });
}

export function verifyUploadToken(token: string, objectId: string): boolean {
  try {
    const payload = jwt.verify(token, JWT_SECRET as string) as UploadTokenPayload;
    return payload.purpose === "object-upload" && payload.objectId === objectId;
  } catch {
    return false;
  }
}

function resolveWithinRoot(relativePath: string): string {
  const full = path.resolve(LOCAL_STORAGE_ROOT, relativePath);
  if (full !== LOCAL_STORAGE_ROOT && !full.startsWith(LOCAL_STORAGE_ROOT + path.sep)) {
    throw new Error("Invalid object path");
  }
  return full;
}

/**
 * Local-disk object storage driver. Used automatically when not running on
 * Replit (i.e. outside the Replit sidecar's reach), such as on Coolify or any
 * other Docker host. Files are stored under LOCAL_STORAGE_DIR, which should be
 * mounted as a persistent volume in production so uploads survive redeploys.
 */
export class LocalObjectStorageService {
  constructor() {
    fs.mkdirSync(path.join(LOCAL_STORAGE_ROOT, "uploads"), { recursive: true });
  }

  /**
   * Returns a same-origin upload URL (signed with a short-lived token) that the
   * client can PUT the file to directly, mirroring the presigned-URL contract
   * used by the Replit/GCS driver.
   */
  async getObjectEntityUploadURL(appBaseUrl: string): Promise<{ uploadURL: string; objectPath: string }> {
    const objectId = randomUUID();
    const token = signUploadToken(objectId);
    const objectPath = `/objects/uploads/${objectId}`;
    const uploadURL = `${appBaseUrl.replace(/\/$/, "")}/api/storage/local-uploads/${objectId}?token=${token}`;
    return { uploadURL, objectPath };
  }

  async writeUpload(objectId: string, stream: NodeJS.ReadableStream): Promise<void> {
    const destPath = resolveWithinRoot(path.join("uploads", objectId));
    await fsp.mkdir(path.dirname(destPath), { recursive: true });
    await new Promise<void>((resolve, reject) => {
      const writeStream = fs.createWriteStream(destPath);
      stream.pipe(writeStream);
      stream.on("error", reject);
      writeStream.on("error", reject);
      writeStream.on("finish", resolve);
    });
  }

  async getObjectEntityFilePath(objectPath: string): Promise<string> {
    if (!objectPath.startsWith("/objects/")) {
      throw new LocalObjectNotFoundError();
    }
    const relative = objectPath.slice("/objects/".length);
    const fullPath = resolveWithinRoot(relative);
    try {
      await fsp.access(fullPath, fs.constants.R_OK);
    } catch {
      throw new LocalObjectNotFoundError();
    }
    return fullPath;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    return rawPath;
  }
}
