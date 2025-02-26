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

// Helper function to deserialize JSON content
const deserializeContent = (page: any): Page => {
  // Create a deep copy of the page
  const deserializedPage = { ...page };
  
  // Ensure status is valid
  if (deserializedPage.status !== 'active' && deserializedPage.status !== 'upcoming') {
    deserializedPage.status = 'upcoming'; // Default to upcoming if invalid
  }
  
  // Handle File objects and other complex types that might be serialized
  if (deserializedPage.content?.es) {
    // Process each section that might contain File objects
    if (deserializedPage.content.es.section1?.backgroundImage) {
      deserializedPage.content.es.section1.backgroundImage = {
        preview: deserializedPage.content.es.section1.backgroundImage.preview || '',
        file: undefined // File objects can't be serialized, so we set to undefined
      };
    }
    
    if (deserializedPage.content.es.section2?.sectionImage) {
      deserializedPage.content.es.section2.sectionImage = {
        preview: deserializedPage.content.es.section2.sectionImage.preview || '',
        file: undefined
      };
    }
    
    // Handle section3 images array
    if (deserializedPage.content.es.section3?.images) {
      deserializedPage.content.es.section3.images = 
        deserializedPage.content.es.section3.images.map((img: any) => ({
          source: img.source || '',
          alt: img.alt || 'Gallery image'
        }));
    }
  }
  
  return deserializedPage as Page;
};

export const useEditPage = (initialPage: any) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Deserialize the page content
  const deserializedPage = deserializeContent(initialPage);
  
  // Page data states
  const [pageName, setPageName] = useState(deserializedPage.name);
  const [status, setStatus] = useState<'active' | 'upcoming'>(deserializedPage.status);
  const [price, setPrice] = useState(deserializedPage.content.es.price || 0);
  
  // Section data states
  const [section1Data, setSection1Data] = useState<sanJuanSection1Type>(
    deserializedPage.content.es.section1 || {} as sanJuanSection1Type
  );
  const [section2Data, setSection2Data] = useState<sanJuansection2Type>(
    deserializedPage.content.es.section2 || {} as sanJuansection2Type
  );
  
  // Initialize section3Data with default empty images array if it doesn't exist
  const defaultSection3Data: sanJuanSection3Type = {
    images: []
  };
  
  const [section3Data, setSection3Data] = useState<sanJuanSection3Type>(
    deserializedPage.content.es.section3 
      ? {
          ...deserializedPage.content.es.section3,
          images: deserializedPage.content.es.section3.images || []
        }
      : defaultSection3Data
  );
  
  const [section4Data, setSection4Data] = useState<sanJuansection4Type>(
    deserializedPage.content.es.section4 || {} as sanJuansection4Type
  );
  const [section5Data, setSection5Data] = useState<sanJuanSection5Type>(
    deserializedPage.content.es.section5 || {} as sanJuanSection5Type
  );
  
  // Initialize section6Data with default empty list array if it doesn't exist
  const defaultSection6Data: SanJuanSection6Type = {
    cardTitle: "",
    cardDescription: "",
    firstH4: "",
    list: [],
    secondH4: "",
    secondH4span: "",
    button: ""
  };
  
  const [section6Data, setSection6Data] = useState<SanJuanSection6Type>(
    deserializedPage.content.es.section6 
      ? {
          ...deserializedPage.content.es.section6,
          list: deserializedPage.content.es.section6.list || []
        }
      : defaultSection6Data
  );
  
  const [indexSection5Data, setIndexSection5Data] = useState<IndexSection5Type>(
    deserializedPage.content.es.indexSection5 || {} as IndexSection5Type
  );
  
  // Initialize with default empty timeline if none exists
  const defaultTimeline: TimelineDataType = {
    title: "",
    subtitle: "",
    steps: []
  };
  
  const [timelineData, setTimelineData] = useState<TimelineDataType>(
    deserializedPage.content.es.timeline || defaultTimeline
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

  const handleSavePage = async () => {
    if (!pageName.trim()) {
      setSaveError("El nombre del tour es obligatorio");
      return;
    }

    // Validate status
    if (status !== 'active' && status !== 'upcoming') {
      setSaveError("El estado debe ser 'active' o 'upcoming'");
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
      formData.append("id", deserializedPage._id || "");

      // Send update request
      const response = await fetch(`/api/pages/update/${deserializedPage._id}`, {
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
    setPageName,
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