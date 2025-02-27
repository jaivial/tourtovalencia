import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useImageProcessing } from '../../hooks/useImageProcessing';

const ImageUploadTest: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Result, setBase64Result] = useState<string | null>(null);
  const { processImages, isProcessing } = useImageProcessing();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Reset the base64 result
    setBase64Result(null);
  };

  const handleConvertToBase64 = async () => {
    if (!selectedFile || !previewUrl) return;
    
    try {
      // Create a test object with the image data
      const testData = {
        image: {
          preview: previewUrl,
          file: selectedFile
        }
      };
      
      // Process the test data
      const processedData = await processImages(testData);
      
      // Extract the base64 result
      const base64 = processedData.image && 
        typeof processedData.image === 'object' && 
        'preview' in processedData.image ? 
        processedData.image.preview as string : null;
      
      setBase64Result(base64);
      
      console.log('Original preview URL:', previewUrl);
      console.log('Processed base64:', base64?.substring(0, 100) + '...');
    } catch (error) {
      console.error('Error converting to base64:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Image Upload Test</h2>
      
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      
      {previewUrl && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Preview:</h3>
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="max-w-full h-auto max-h-64 rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">
            Preview URL: {previewUrl}
          </p>
        </div>
      )}
      
      <Button
        onClick={handleConvertToBase64}
        disabled={!selectedFile || isProcessing}
        className="mb-4"
      >
        {isProcessing ? 'Converting...' : 'Convert to Base64'}
      </Button>
      
      {base64Result && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Base64 Result:</h3>
          <img 
            src={base64Result} 
            alt="Base64 Result" 
            className="max-w-full h-auto max-h-64 rounded-md"
          />
          <div className="mt-2 p-2 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-700 break-all">
              {base64Result.substring(0, 100)}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadTest; 