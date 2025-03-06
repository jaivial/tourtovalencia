import { useCallback, useState, useEffect } from "react";
import { sanJuanSection1Type } from "~/data/data";

export const useEditableSanJuanSection1 = (initialData: sanJuanSection1Type) => {
  const [sectionData, setSectionData] = useState<sanJuanSection1Type>(initialData);
  
  // Update sectionData when initialData changes
  useEffect(() => {
    console.log("useEditableSanJuanSection1: initialData changed:", initialData);
    setSectionData(initialData);
  }, [initialData]);

  const handleTextUpdate = (field: keyof sanJuanSection1Type, value: string) => {
    console.log(`useEditableSanJuanSection1: updating ${String(field)} to:`, value);
    setSectionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (file: File) => {
    const preview = URL.createObjectURL(file);
    console.log("useEditableSanJuanSection1: updating backgroundImage to:", preview);
    setSectionData(prev => ({
      ...prev,
      backgroundImage: { file, preview }
    }));
  };

  const handleImageRemove = () => {
    console.log("useEditableSanJuanSection1: removing backgroundImage");
    setSectionData(prev => ({
      ...prev,
      backgroundImage: { preview: "" }
    }));
  };

  return {
    sectionData,
    handleTextUpdate,
    handleImageChange,
    handleImageRemove
  };
};

export const useImageUpload = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  }, []);

  const handleImageRemove = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
  }, [imagePreview]);

  return {
    imagePreview,
    imageFile,
    handleImageChange,
    handleImageRemove
  };
};
