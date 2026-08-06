import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import type { Readable } from "stream";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be set. Did you forget to configure it?");
}

const UPLOAD_TOKEN_TTL_SECONDS = 15 * 60; // matches signed-URL TTL used by the Replit driver

export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Content types the admin dashboard legitimately uploads: gallery/staff/event
 * photos (jpeg/png/webp/gif), timetable PDFs, and adhan audio / video clips.
 * Anything else — notably SVG, which can carry scripts and would be served
 * same-origin — is rejected with 415.
 */
const ALLOWED_UPLOAD_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "video/mp4",
]);

export function isAllowedUploadContentType(contentType: string): boolean {
  const mediaType = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return ALLOWED_UPLOAD_CONTENT_TYPES.has(mediaType);
}

export class UploadTooLargeError extends Error {
  constructor() {
    super(`Upload exceeds maximum size of ${MAX_UPLOAD_SIZE_BYTES} bytes`);
    this.name = "UploadTooLargeError";
    Object.setPrototypeOf(this, UploadTooLargeError.prototype);
  }
}

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

  async writeUpload(objectId: string, stream: Readable): Promise<void> {
    const destPath = resolveWithinRoot(path.join("uploads", objectId));
    await fsp.mkdir(path.dirname(destPath), { recursive: true });
    await new Promise<void>((resolve, reject) => {
      const writeStream = fs.createWriteStream(destPath);
      let bytesReceived = 0;
      let settled = false;

      const fail = (err: Error) => {
        if (settled) return;
        settled = true;
        stream.unpipe(writeStream);
        stream.destroy();
        writeStream.destroy();
        // Best-effort cleanup of the partial file; ignore failures.
        fsp.unlink(destPath).catch(() => {});
        reject(err);
      };

      stream.on("data", (chunk: Buffer | string) => {
        bytesReceived += Buffer.byteLength(chunk);
        if (bytesReceived > MAX_UPLOAD_SIZE_BYTES) {
          fail(new UploadTooLargeError());
        }
      });
      stream.on("error", fail);
      writeStream.on("error", fail);
      writeStream.on("finish", () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      });
      stream.pipe(writeStream);
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
