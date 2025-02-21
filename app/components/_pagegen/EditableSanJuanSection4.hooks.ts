import { useState } from "react";
import { sanJuansection4Type } from "~/data/data";

export const useEditableSanJuanSection4 = (initialData: sanJuansection4Type) => {
  const [sectionData, setSectionData] = useState<sanJuansection4Type>(initialData);

  const handleTextUpdate = (field: keyof sanJuansection4Type, value: string) => {
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
