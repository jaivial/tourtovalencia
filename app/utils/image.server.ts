import { Buffer } from 'buffer';

export async function convertBlobUrlToBase64(blobUrl: string): Promise<string> {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    console.error('Error converting blob to base64:', error);
    throw error;
  }
}

export function processImageData(content: Record<string, any>): Promise<Record<string, any>> {
  const processObject = async (obj: any): Promise<any> => {
    if (!obj || typeof obj !== 'object') return obj;

    const result: any = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        if ('preview' in value && value.preview?.startsWith('blob:')) {
          // Convert blob URL to base64
          result[key] = {
            ...value,
            preview: await convertBlobUrlToBase64(value.preview)
          };
        } else if (Array.isArray(value) && value.some(item => item?.source?.startsWith('blob:'))) {
          // Handle array of images (like in section3)
          result[key] = await Promise.all(
            value.map(async (item) => {
              if (item?.source?.startsWith('blob:')) {
                return {
                  ...item,
                  source: await convertBlobUrlToBase64(item.source)
                };
              }
              return item;
            })
          );
        } else {
          // Recursively process nested objects
          result[key] = await processObject(value);
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  };

  return processObject(content);
}
