/**
 * Base64 serialization types for File objects
 * Files are converted to base64 strings for JSON transmission
 */

/**
 * Represents a File object serialized to base64
 */
export interface SerializedFile {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  data: string; // Base64 string
}

/**
 * Type for fields that can be either a File or a base64 serialized File
 */
export type FileOrSerialized = File | SerializedFile;

/**
 * Type guard to check if object is a File
 */
export function isFile(obj: unknown): obj is File {
  return obj instanceof File;
}

/**
 * Type guard to check if object is a SerializedFile
 */
export function isSerializedFile(obj: unknown): obj is SerializedFile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof (obj as any).name === 'string' &&
    'type' in obj &&
    typeof (obj as any).type === 'string' &&
    'size' in obj &&
    typeof (obj as any).size === 'number' &&
    'data' in obj &&
    typeof (obj as any).data === 'string'
  );
}

/**
 * Convert a File to base64 SerializedFile
 */
export async function serializeFile(file: File): Promise<SerializedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const data = reader.result as string;
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data,
      });
    };
    reader.onerror = () => reject(new Error('Failed to serialize file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Reconstruct a File from base64 SerializedFile
 */
export function deserializeFile(serialized: SerializedFile): File {
  // Extract base64 data without prefix
  const base64Data = serialized.data.split(',')[1];

  // Convert base64 to binary
  const byteString = atob(base64Data);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new File([arrayBuffer], serialized.name, {
    type: serialized.type,
    lastModified: serialized.lastModified,
  });
}
