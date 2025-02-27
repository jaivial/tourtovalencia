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
      console.log('Not a blob URL, skipping conversion:', blobUrl.substring(0, 30) + '...');
      return blobUrl;
    }

    console.log('Converting blob URL to base64:', blobUrl);
    
    // Fetch the blob data
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log('Converted blob URL to base64:', base64String.substring(0, 30) + '...');
        resolve(base64String);
      };
      reader.onerror = (error) => {
        console.error('Error reading blob as data URL:', error);
        reject(error);
      };
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
  console.log('Converting File to base64:', file.name, file.type, file.size);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      console.log('Converted File to base64:', result.substring(0, 30) + '...');
      resolve(result);
    };
    reader.onerror = (error) => {
      console.error('Error reading File as data URL:', error);
      reject(error);
    };
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

  console.log('Processing content:', typeof content, Array.isArray(content) ? 'array' : 'object');
  
  // Handle arrays
  if (Array.isArray(content)) {
    console.log('Processing array with', content.length, 'items');
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
      console.log(`Converting blob URL for key "${key}":`, value);
      result[key] = await convertBlobUrlToBase64(value);
      continue;
    }

    // Handle image objects with blob URL previews or File objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      // Handle image objects with preview property
      if ('preview' in value) {
        const imgObj = value as ImageWithPreview;
        console.log(`Found image object with preview for key "${key}":`, 
          typeof imgObj.preview === 'string' ? imgObj.preview.substring(0, 30) + '...' : 'not a string',
          imgObj.file instanceof File ? `File: ${imgObj.file.name}` : 'No File');
        
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
        console.log(`Found image object with source for key "${key}":`, 
          typeof imgObj.source === 'string' ? imgObj.source.substring(0, 30) + '...' : 
          imgObj.source instanceof File ? `File: ${imgObj.source.name}` : 'not a string or File');
        
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
      console.log(`Processing array for key "${key}" with`, value.length, 'items');
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