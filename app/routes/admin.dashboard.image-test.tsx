import React from 'react';
import ImageUploadTest from '~/components/_pagegen/ImageUploadTest';

export default function ImageTestRoute() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Image Upload Testing</h1>
      <p className="mb-6 text-gray-600">
        This page is for testing image uploads and conversion to base64.
      </p>
      
      <ImageUploadTest />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Debugging Tips</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Check the browser console for detailed logs about the image processing.</li>
          <li>The preview URL should be a blob URL (starts with "blob:").</li>
          <li>The base64 result should start with "data:image/".</li>
          <li>If conversion fails, check for errors in the console.</li>
        </ul>
      </div>
    </div>
  );
} 