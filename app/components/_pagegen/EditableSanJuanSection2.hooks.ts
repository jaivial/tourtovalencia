import { useState } from "react";
import { sanJuansection2Type } from "~/data/data";

export const useEditableSanJuanSection2 = (initialData: sanJuansection2Type) => {
  const [sectionData, setSectionData] = useState<sanJuansection2Type>(initialData);

  const handleTextUpdate = (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string }) => {
    setSectionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (file: File) => {
    const preview = URL.createObjectURL(file);
    handleTextUpdate('sectionImage', { file, preview });
  };

  const handleImageRemove = () => {
    handleTextUpdate('sectionImage', { preview: '' });
  };

  return {
    sectionData,
    handleTextUpdate,
    handleImageChange,
    handleImageRemove
  };
};
