import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { writeAsyncIterableToWritable } from "@remix-run/node";

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || "https://c18e9c6335e00ecb50b8a24c8ddfe31c.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "menustudio-images-test";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-b33f26330e8542cbbcca76ef18d29dd0.r2.dev";

export interface UploadResult {
  url: string;
  key: string;
  success: boolean;
  error?: string;
}

/**
 * Upload a file to R2 and return the public URL
 */
export async function uploadToR2(
  file: AsyncIterable<Uint8Array> | File,
  key: string,
  contentType?: string
): Promise<UploadResult> {
  try {
    let body: AsyncIterable<Uint8Array>;
    
    if (file instanceof File) {
      // Convert File to async iterable
      body = fileToAsyncIterable(file);
    } else {
      body = file;
    }

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType || "image/jpeg",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const url = `${PUBLIC_URL}/${key}`;
    console.log(`[R2] Uploaded successfully: ${url}`);

    return {
      url,
      key,
      success: true,
    };
  } catch (error) {
    console.error("[R2] Upload error:", error);
    return {
      url: "",
      key,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Upload an image from base64 string to R2
 */
export async function uploadBase64ToR2(
  base64Data: string,
  folder: string = "uploads",
  filename?: string
): Promise<UploadResult> {
  try {
    // Extract base64 content and mime type
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) {
      // Not a valid base64 data URL, might be already a URL
      if (base64Data.startsWith("http")) {
        return {
          url: base64Data,
          key: "",
          success: true,
        };
      }
      throw new Error("Invalid base64 data URL format");
    }

    const mimeType = matches[1];
    const base64Content = matches[2];
    const buffer = Buffer.from(base64Content, "base64");
    const ext = mimeType.split("/")[1] || "jpg";
    const name = filename || `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const key = `${folder}/${name}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const url = `${PUBLIC_URL}/${key}`;
    console.log(`[R2] Uploaded base64 image: ${url}`);

    return {
      url,
      key,
      success: true,
    };
  } catch (error) {
    console.error("[R2] Base64 upload error:", error);
    return {
      url: "",
      key: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete an image from R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
    console.log(`[R2] Deleted: ${key}`);
    return true;
  } catch (error) {
    console.error("[R2] Delete error:", error);
    return false;
  }
}

/**
 * Generate a presigned URL for direct upload from client
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for download
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

// Helper function to convert File to async iterable
async function* fileToAsyncIterable(file: File): AsyncIterable<Uint8Array> {
  const reader = file.stream().getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield value;
  }
}

/**
 * Check if a string is a valid R2 URL
 */
export function isR2Url(url: string): boolean {
  return (
    url.startsWith(PUBLIC_URL) ||
    url.includes(".r2.cloudflarestorage.com") ||
    url.includes(".r2.dev")
  );
}

/**
 * Extract key from R2 URL
 */
export function getKeyFromUrl(url: string): string {
  if (url.startsWith(PUBLIC_URL)) {
    return url.replace(PUBLIC_URL + "/", "");
  }
  // Handle other R2 URL formats
  const match = url.match(/\/([^\/]+\/[^\/]+)$/);
  return match ? match[1] : "";
}
