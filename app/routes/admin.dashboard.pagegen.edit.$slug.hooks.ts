import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { Page } from "~/utils/db.schema.server";
import type { 
  IndexSection5Type, 
  sanJuanSection1Type, 
  sanJuanSection3Type, 
  sanJuansection2Type, 
  sanJuansection4Type, 
  sanJuanSection5Type, 
  SanJuanSection6Type 
} from "~/data/data";
import type { TimelineDataType } from "~/components/_index/EditableTimelineFeature";

export const useEditPage = (initialPage: Page) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Page data states
  const [pageName, setPageName] = useState(initialPage.name);
  const [status, setStatus] = useState<'active' | 'upcoming'>(initialPage.status);
  const [price, setPrice] = useState(initialPage.content.es.price || 0);
  
  // Section data states
  const [section1Data, setSection1Data] = useState<sanJuanSection1Type>(
    initialPage.content.es.section1 || {} as sanJuanSection1Type
  );
  const [section2Data, setSection2Data] = useState<sanJuansection2Type>(
    initialPage.content.es.section2 || {} as sanJuansection2Type
  );
  const [section3Data, setSection3Data] = useState<sanJuanSection3Type>(
    initialPage.content.es.section3 || {} as sanJuanSection3Type
  );
  const [section4Data, setSection4Data] = useState<sanJuansection4Type>(
    initialPage.content.es.section4 || {} as sanJuansection4Type
  );
  const [section5Data, setSection5Data] = useState<sanJuanSection5Type>(
    initialPage.content.es.section5 || {} as sanJuanSection5Type
  );
  const [section6Data, setSection6Data] = useState<SanJuanSection6Type>(
    initialPage.content.es.section6 || {} as SanJuanSection6Type
  );
  const [indexSection5Data, setIndexSection5Data] = useState<IndexSection5Type>(
    initialPage.content.es.indexSection5 || {} as IndexSection5Type
  );
  
  // Initialize with default empty timeline if none exists
  const defaultTimeline: TimelineDataType = {
    title: "",
    subtitle: "",
    steps: []
  };
  
  const [timelineData, setTimelineData] = useState<TimelineDataType>(
    initialPage.content.es.timeline || defaultTimeline
  );

  // Status change handler
  const handleStatusChange = (newStatus: 'active' | 'upcoming') => {
    setStatus(newStatus);
  };

  // Price change handler
  const handlePriceChange = (newPrice: number) => {
    setPrice(newPrice);
  };

  // Section update handlers
  const handleSection1Update = (data: sanJuanSection1Type) => {
    setSection1Data(data);
  };

  const handleSection2Update = (data: sanJuansection2Type) => {
    setSection2Data(data);
  };

  const handleSection3ImageUpdate = (index: number, imageData: string) => {
    const updatedData = { ...section3Data };
    if (!updatedData.images) {
      updatedData.images = [];
    }
    if (typeof imageData === 'string') {
      updatedData.images[index] = { source: imageData, alt: 'Gallery image' };
    }
    setSection3Data(updatedData);
  };

  const handleSection3ImageRemove = (index: number) => {
    const updatedData = { ...section3Data };
    if (updatedData.images && updatedData.images.length > index) {
      updatedData.images.splice(index, 1);
      setSection3Data(updatedData);
    }
  };

  const handleSection4Update = (data: sanJuansection4Type) => {
    setSection4Data(data);
  };

  const handleSection5Update = (data: sanJuanSection5Type) => {
    setSection5Data(data);
  };

  const handleSection6Update = (data: SanJuanSection6Type) => {
    setSection6Data(data);
  };

  const handleIndexSection5Update = (data: IndexSection5Type) => {
    setIndexSection5Data(data);
  };

  const handleTimelineUpdate = (data: TimelineDataType) => {
    setTimelineData(data);
  };

  // Save page handler
  const handleSavePage = async () => {
    if (!pageName.trim()) {
      setSaveError("El nombre del tour es obligatorio");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Prepare content object
      const content = {
        indexSection5: indexSection5Data,
        section1: section1Data,
        section2: section2Data,
        section3: section3Data,
        section4: section4Data,
        section5: section5Data,
        section6: section6Data,
        timeline: timelineData,
        price: price
      };

      // Create form data
      const formData = new FormData();
      formData.append("name", pageName);
      formData.append("content", JSON.stringify(content));
      formData.append("status", status);
      formData.append("id", initialPage._id || "");

      // Send update request
      const response = await fetch(`/api/pages/update/${initialPage._id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el tour");
      }

      setSaveSuccess(true);
      
      // Navigate back to the edit page list after a short delay
      setTimeout(() => {
        navigate("/admin/dashboard/pagegen/editpage", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Error saving page:", error);
      setSaveError(error instanceof Error ? error.message : "Error al guardar el tour");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel edit handler
  const handleCancel = () => {
    navigate("/admin/dashboard/pagegen/editpage", { replace: true });
  };

  return {
    // States
    pageName,
    status,
    price,
    section1Data,
    section2Data,
    section3Data,
    section4Data,
    section5Data,
    section6Data,
    indexSection5Data,
    timelineData,
    isSaving,
    saveError,
    saveSuccess,

    // Setters
    setPageName,

    // Handlers
    handleStatusChange,
    handlePriceChange,
    handleSection1Update,
    handleSection2Update,
    handleSection3ImageUpdate,
    handleSection3ImageRemove,
    handleSection4Update,
    handleSection5Update,
    handleSection6Update,
    handleIndexSection5Update,
    handleTimelineUpdate,
    handleSavePage,
    handleCancel
  };
}; 