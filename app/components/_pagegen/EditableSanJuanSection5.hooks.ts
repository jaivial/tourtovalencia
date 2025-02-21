import { useState } from "react";
import { sanJuanSection5Type } from "~/data/data";

export const useEditableSanJuanSection5 = (initialData: sanJuanSection5Type) => {
  const [sectionData, setSectionData] = useState<sanJuanSection5Type>(initialData);

  const handleTextUpdate = (field: keyof sanJuanSection5Type, value: string) => {
    setSectionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    sectionData,
    handleTextUpdate
  };
};
