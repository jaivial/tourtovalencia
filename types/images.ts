import { FileOrSerialized, isFile, serializeFile } from './serialization';

/**
 * STRICT interface for image data with optional file
 */
export interface ImageData {
  file?: FileOrSerialized;
  preview: string;
  enabled?: boolean;
  src?: string;
}

/**
 * STRICT interface for image gallery
 */
export interface ImageGallery {
  width: number;
  images: ImageData[];
}

/**
 * Process images for server transmission by converting Files to base64
 */
export async function processImagesForServer(
  images: ImageData[]
): Promise<ImageData[]> {
  return Promise.all(
    images.map(async (img): Promise<ImageData> => {
      if (img.file && isFile(img.file)) {
        const serialized = await serializeFile(img.file);
        return { ...img, file: serialized };
      }
      return img;
    })
  );
}
