import { useState } from "react";
import { sanJuanSection3Type } from "~/data/data";

export const useEditableSanJuanSection3 = (initialData: sanJuanSection3Type) => {
  const [sectionData, setSectionData] = useState<sanJuanSection3Type>(initialData);

  const handleImageUpdate = (index: number, file: File) => {
    const preview = URL.createObjectURL(file);
    setSectionData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, source: preview } : img
      )
    }));
  };

  const handleImageRemove = (index: number) => {
    setSectionData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, source: "" } : img
      )
    }));
  };

  return {
    sectionData,
    handleImageUpdate,
    handleImageRemove
  };
};
