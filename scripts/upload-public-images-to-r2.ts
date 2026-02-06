/**
 * Script to upload public folder images to Cloudflare R2
 * Run: cd /var/www/tourtovalencia && npx tsx scripts/upload-public-images-to-r2.ts
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { pipeline } from "stream/promises";
import { createHash } from "crypto";

dotenv.config();

const R2_ENDPOINT = process.env.R2_ENDPOINT || "https://c18e9c6335e00ecb50b8a24c8ddfe31c.r2.cloudflarestorage.com";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "menustudio-images-test";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-b33f26330e8542cbbcca76ef18d29dd0.r2.dev";
const PUBLIC_DIR = "/var/www/tourtovalencia/public";

const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

interface UploadResult {
  localPath: string;
  r2Key: string;
  r2Url: string;
  size: number;
  hash: string;
}

function getFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return createHash("md5").update(content).digest("hex");
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };
  return types[ext] || "application/octet-stream";
}

async function uploadFile(filePath: string, key: string): Promise<UploadResult> {
  const fileStream = fs.createReadStream(filePath);
  const stat = await fs.promises.stat(filePath);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: getContentType(filePath),
    })
  );

  return {
    localPath: filePath,
    r2Key: key,
    r2Url: `${R2_PUBLIC_URL}/${key}`,
    size: stat.size,
    hash: getFileHash(filePath),
  };
}

async function main() {
  console.log("=== Uploading public images to R2 ===\n");

  // Find all image files
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const files: string[] = [];

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (imageExtensions.includes(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }

  scanDir(PUBLIC_DIR);
  console.log(`Found ${files.length} image files\n`);

  const results: UploadResult[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const relativePath = path.relative(PUBLIC_DIR, file);
    const key = `tourtovalencia/public/${relativePath}`;

    try {
      console.log(`Uploading: ${relativePath}`);
      const result = await uploadFile(file, key);
      results.push(result);
      console.log(`  -> ${result.r2Url}\n`);
    } catch (error) {
      const errorMsg = `Error uploading ${relativePath}: ${error}`;
      errors.push(errorMsg);
      console.error(`  ERROR: ${error}\n`);
    }
  }

  // Generate mapping file
  const mappingPath = "/var/www/tourtovalencia/scripts/r2-public-images-mapping.json";
  const mapping = results.map((r) => ({
    localPath: r.localPath,
    r2Url: r.r2Url,
  }));
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`\nMapping saved to: ${mappingPath}`);

  console.log("\n=== Summary ===");
  console.log(`Total files: ${files.length}`);
  console.log(`Uploaded: ${results.length}`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((e) => console.log(`  - ${e}`));
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
