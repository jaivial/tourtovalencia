import { useState, useEffect } from "react";
import { sanJuanSection5Type } from "~/data/data";

export const useEditableSanJuanSection5 = (initialData: sanJuanSection5Type) => {
  const [sectionData, setSectionData] = useState<sanJuanSection5Type>(initialData);
  
  // Update sectionData when initialData changes
  useEffect(() => {
    console.log("useEditableSanJuanSection5: initialData changed:", initialData);
    setSectionData(initialData);
  }, [initialData]);

  const handleTextUpdate = (field: keyof sanJuanSection5Type, value: string) => {
    console.log(`useEditableSanJuanSection5: updating ${String(field)} to:`, value);
    setSectionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpdate = (imageBase64: string) => {
    console.log("useEditableSanJuanSection5: updating image to:", 
      imageBase64 ? (imageBase64.length > 30 ? imageBase64.substring(0, 30) + '...' : imageBase64) : 'none');
    setSectionData(prev => ({
      ...prev,
      image: imageBase64
    }));
  };

  return {
    sectionData,
    handleTextUpdate,
    handleImageUpdate
  };
};
