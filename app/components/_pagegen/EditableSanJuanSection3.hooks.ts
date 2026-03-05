import { useState } from "react";
import { sanJuanSection3Type } from "~/data/data";
import { convertFileToBase64 } from "~/utils/image.client";

export const useEditableSanJuanSection3 = (initialData: sanJuanSection3Type) => {
  const [sectionData, setSectionData] = useState<sanJuanSection3Type>(initialData);

  const handleImageUpdate = async (index: number, file: File) => {
    try {
      const preview = await convertFileToBase64(file);
      setSectionData(prev => ({
        ...prev,
        images: prev.images.map((img, i) => 
          i === index ? { ...img, source: preview } : img
        )
      }));
    } catch (error) {
      console.error(`useEditableSanJuanSection3: Failed to convert image ${index} to base64`, error);
    }
  };

  const handleImageRemove = (index: number) => {
    setSectionData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, source: null } : img
      )
    }));
  };

  return {
    sectionData,
    handleImageUpdate,
    handleImageRemove
  };
};
