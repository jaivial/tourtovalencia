import { useState } from "react";
import { sanJuansection2Type } from "~/data/data";

export const useEditableSanJuanSection2 = (initialText: sanJuansection2Type) => {
  const [sectionText, setSectionText] = useState<sanJuansection2Type>(initialText);

  const handleTextUpdate = (key: keyof sanJuansection2Type, value: string) => {
    setSectionText(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    sectionText,
    handleTextUpdate
  };
};
