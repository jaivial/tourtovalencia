import { json, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/server-runtime";
import { uploadToR2, isR2Url } from "~/utils/r2.server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Handle multipart form data
    const uploadHandler = unstable_createMemoryUploadHandler({
      maxPartSize: MAX_FILE_SIZE,
    });

    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "tourtovalencia";
    const filename = formData.get("filename") as string | null;

    if (!file || !(file instanceof File)) {
      return json({ 
        success: false, 
        error: "No file provided or invalid file type" 
      }, { status: 400 });
    }

    // Generate unique key for the file
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split(".").pop() || "jpg";
    const key = `${folder}/${timestamp}-${randomStr}.${ext}`;

    // Upload to R2
    const result = await uploadToR2(file, key, file.type);

    if (!result.success) {
      return json({ 
        success: false, 
        error: result.error || "Upload failed" 
      }, { status: 500 });
    }

    return json({
      success: true,
      url: result.url,
      key: result.key,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("[API Upload] Error:", error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

// GET endpoint to check if R2 is configured
export async function loader() {
  return json({
    configured: !!process.env.R2_ENDPOINT && !!process.env.R2_ACCESS_KEY_ID,
    endpoint: process.env.R2_ENDPOINT || null,
    bucket: process.env.R2_BUCKET_NAME || null,
  });
}
