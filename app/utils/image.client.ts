/**
 * Client-side image utilities for handling blob URLs and File objects
 */

/**
 * Converts a blob URL to a base64 string
 * This function should only be used on the client side
 */
export async function convertBlobUrlToBase64(blobUrl: string): Promise<string> {
  try {
    // Skip if not a blob URL
    if (!blobUrl.startsWith('blob:')) {
      return blobUrl;
    }

    // Fetch the blob data
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting blob URL to base64:', error);
    return ''; // Return empty string as fallback
  }
}

/**
 * Converts a File object to a base64 string
 */
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Define types for image-related objects
type ImageWithPreview = { preview: string; file?: File; [key: string]: unknown };
type ImageWithSource = { source: string | File; alt?: string; [key: string]: unknown };

/**
 * Processes all image data in a content object, converting blob URLs and File objects to base64 strings
 * This should be called before sending data to the server
 */
export async function processImageData(content: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (!content || typeof content !== 'object') return content;

  // Handle arrays
  if (Array.isArray(content)) {
    return Promise.all(content.map(item => 
      processImageData(item as Record<string, unknown>)
    )) as unknown as Record<string, unknown>;
  }

  // Process object properties
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(content)) {
    // Skip null or undefined values
    if (value == null) {
      result[key] = value;
      continue;
    }

    // Handle string values that are blob URLs
    if (typeof value === 'string' && value.startsWith('blob:')) {
      result[key] = await convertBlobUrlToBase64(value);
      continue;
    }

    // Handle image objects with blob URL previews or File objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      // Handle image objects with preview property
      if ('preview' in value) {
        const imgObj = value as ImageWithPreview;
        
        // Convert blob URL preview to base64
        if (typeof imgObj.preview === 'string' && imgObj.preview.startsWith('blob:')) {
          result[key] = {
            ...imgObj,
            preview: await convertBlobUrlToBase64(imgObj.preview)
          };
          continue;
        }
        
        // Convert File object to base64 if present
        if (imgObj.file instanceof File) {
          result[key] = {
            ...imgObj,
            preview: await convertFileToBase64(imgObj.file)
          };
          continue;
        }
      }
      
      // Handle image objects with source property (like gallery images)
      if ('source' in value) {
        const imgObj = value as ImageWithSource;
        
        // Convert blob URL source to base64
        if (typeof imgObj.source === 'string' && imgObj.source.startsWith('blob:')) {
          result[key] = {
            ...imgObj,
            source: await convertBlobUrlToBase64(imgObj.source)
          };
          continue;
        }
        
        // Convert File object to base64
        if (imgObj.source instanceof File) {
          result[key] = {
            ...imgObj,
            source: await convertFileToBase64(imgObj.source)
          };
          continue;
        }
      }
      
      // Recursively process nested objects
      result[key] = await processImageData(value as Record<string, unknown>);
      continue;
    }
    
    // Handle arrays that might contain image objects
    if (Array.isArray(value)) {
      result[key] = await Promise.all(
        value.map(item => 
          typeof item === 'object' && item !== null 
            ? processImageData(item as Record<string, unknown>) 
            : item
        )
      );
      continue;
    }
    
    // Default case: keep the value as is
    result[key] = value;
  }
  
  return result;
} 