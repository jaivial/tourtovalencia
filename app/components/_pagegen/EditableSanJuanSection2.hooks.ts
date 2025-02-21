import { useState } from "react";
import { sanJuansection2Type } from "~/data/data";

export const useEditableSanJuanSection2 = (initialText: sanJuansection2Type) => {
  const [sectionText, setSectionText] = useState<sanJuansection2Type>(initialText);

  const handleTextUpdate = (key: keyof sanJuansection2Type, value: string | { file?: File; preview: string }) => {
    setSectionText(prev => ({
      ...prev,
      [key]: value
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
    sectionText,
    handleTextUpdate,
    handleImageChange,
    handleImageRemove
  };
};
