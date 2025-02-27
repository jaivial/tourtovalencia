import { useState } from 'react';
import { processImageData } from '../utils/image.client';

/**
 * Hook for processing image data before submitting to the server
 * Converts blob URLs and File objects to base64 strings
 */
export function useImageProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Process all image data in a content object
   * @param content The content object to process
   * @returns The processed content object with all blob URLs and File objects converted to base64 strings
   */
  const processImages = async <T extends Record<string, unknown>>(content: T): Promise<T> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Process all image data in the content object
      const processedContent = await processImageData(content);
      return processedContent as T;
    } catch (err) {
      console.error('Error processing images:', err);
      setError(err instanceof Error ? err : new Error('Unknown error processing images'));
      // Return the original content if processing fails
      return content;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processImages,
    isProcessing,
    error
  };
} 