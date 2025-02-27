import React, { useState } from 'react';
import EditableSanJuanSection3 from '~/components/_pagegen/EditableSanJuanSection3';
import { Button } from '~/components/ui/button';

// Define a sample data structure for testing
const initialData = {
  images: [
    { source: '', alt: 'Gallery image 1' },
    { source: '', alt: 'Gallery image 2' },
    { source: '', alt: 'Gallery image 3' },
    { source: '', alt: 'Gallery image 4' },
    { source: '', alt: 'Gallery image 5' },
    { source: '', alt: 'Gallery image 6' },
    { source: '', alt: 'Gallery image 7' },
    { source: '', alt: 'Gallery image 8' }
  ]
};

export default function SanJuanSection3TestRoute() {
  const [data, setData] = useState(initialData);
  const [width, setWidth] = useState(1200); // Default to desktop view
  const [lastUpdatedImage, setLastUpdatedImage] = useState<{ index: number, base64: string | null }>({ index: -1, base64: null });

  // Handle image update
  const handleImageUpdate = (index: number, base64: string) => {
    console.log(`Section3Test: Updating image at index ${index}`);
    console.log(`Section3Test: Base64 starts with: ${base64.substring(0, 30)}...`);
    
    setData(prevData => {
      const newImages = [...prevData.images];
      newImages[index] = { ...newImages[index], source: base64 };
      return { ...prevData, images: newImages };
    });
    
    setLastUpdatedImage({ index, base64 });
  };

  // Handle image removal
  const handleImageRemove = (index: number) => {
    console.log(`Section3Test: Removing image at index ${index}`);
    
    setData(prevData => {
      const newImages = [...prevData.images];
      newImages[index] = { ...newImages[index], source: '' };
      return { ...prevData, images: newImages };
    });
    
    setLastUpdatedImage({ index, base64: null });
  };

  // Toggle between mobile and desktop view
  const toggleView = () => {
    setWidth(prevWidth => prevWidth > 580 ? 500 : 1200);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">San Juan Section 3 Test</h1>
      <p className="mb-6 text-gray-600">
        This page is for testing image uploads in the EditableSanJuanSection3 component.
      </p>
      
      <div className="mb-6 flex gap-4">
        <Button onClick={toggleView}>
          {width > 580 ? 'Switch to Mobile View' : 'Switch to Desktop View'}
        </Button>
        <span className="text-sm text-gray-500 self-center">
          Current width: {width}px
        </span>
      </div>
      
      <div className={width <= 580 ? 'max-w-[500px] mx-auto border border-gray-300' : ''}>
        <EditableSanJuanSection3
          width={width}
          data={data}
          onUpdate={handleImageUpdate}
          onRemove={handleImageRemove}
        />
      </div>
      
      {lastUpdatedImage.index >= 0 && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Last Updated Image</h2>
          <p>Index: {lastUpdatedImage.index}</p>
          {lastUpdatedImage.base64 ? (
            <>
              <p className="mb-2">Preview:</p>
              <img 
                src={lastUpdatedImage.base64} 
                alt={`Preview of image ${lastUpdatedImage.index}`}
                className="max-w-full h-auto max-h-64 rounded-md"
              />
              <p className="mt-2 text-sm text-gray-500">
                Base64 starts with: {lastUpdatedImage.base64.substring(0, 50)}...
              </p>
            </>
          ) : (
            <p>Image was removed</p>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Debugging Tips</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Check the browser console for detailed logs about the image processing.</li>
          <li>Hover over an image to see the upload and remove buttons.</li>
          <li>After uploading an image, it should appear in the component and in the "Last Updated Image" section.</li>
          <li>If images aren't displaying, check if the base64 string starts with "data:image/".</li>
        </ul>
      </div>
    </div>
  );
} 