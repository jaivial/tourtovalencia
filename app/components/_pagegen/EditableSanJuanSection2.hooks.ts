import { useState } from "react";
import { sanJuansection2Type } from "~/data/data";

export const useEditableSanJuanSection2 = (initialData: sanJuansection2Type) => {
  const [sectionData, setSectionData] = useState<sanJuansection2Type>(initialData);

  const handleTextUpdate = (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string } | { enabled: boolean; src: string }) => {
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

  const handleLottieToggle = (enabled: boolean) => {
    const currentSrc = sectionData.lottieAnimation?.src || "https://lottie.host/c75de82a-9932-4b71-b021-22934b5e5b17/QbeG97Ss7A.lottie";
    handleTextUpdate('lottieAnimation', { enabled, src: currentSrc });
  };

  const handleLottieSourceChange = (src: string) => {
    const enabled = sectionData.lottieAnimation?.enabled ?? true;
    handleTextUpdate('lottieAnimation', { enabled, src });
  };

  return {
    sectionData,
    handleTextUpdate,
    handleImageChange,
    handleImageRemove,
    handleLottieToggle,
    handleLottieSourceChange
  };
};
