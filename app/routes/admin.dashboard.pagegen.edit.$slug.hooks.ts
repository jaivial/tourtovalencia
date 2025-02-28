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
const deserializeContent = (page: Record<string, unknown>): Page => {
  // Create a deep copy of the page
  const deserializedPage = { ...page } as unknown as Page;
  
  // Ensure status is valid
  if (deserializedPage.status !== 'active' && deserializedPage.status !== 'upcoming') {
    deserializedPage.status = 'upcoming'; // Default to upcoming if invalid
  }
  
  // Handle File objects and other complex types that might be serialized
  if (deserializedPage.content?.es) {
    const content = deserializedPage.content as Record<string, Record<string, unknown>>;
    
    // Process each section that might contain File objects
    const esContent = content.es || {};
    
    // Handle section1 backgroundImage
    const section1 = esContent.section1 as Record<string, unknown> | undefined;
    if (section1 && typeof section1 === 'object' && section1.backgroundImage) {
      section1.backgroundImage = {
        preview: (section1.backgroundImage as Record<string, string>)?.preview || '',
        file: undefined // File objects can't be serialized, so we set to undefined
      };
    }
    
    // Handle section2 sectionImage
    const section2 = esContent.section2 as Record<string, unknown> | undefined;
    if (section2 && typeof section2 === 'object' && section2.sectionImage) {
      section2.sectionImage = {
        preview: (section2.sectionImage as Record<string, string>)?.preview || '',
        file: undefined
      };
    }
    
    // Handle section3 images array
    const section3 = esContent.section3 as Record<string, unknown> | undefined;
    if (section3 && typeof section3 === 'object' && section3.images) {
      if (Array.isArray(section3.images)) {
        section3.images = section3.images.map((img: unknown) => ({
          source: (img as Record<string, string>)?.source || '',
          alt: (img as Record<string, string>)?.alt || 'Gallery image'
        }));
      }
    }
  }
  
  return deserializedPage;
};

export const useEditPage = (initialPage: Record<string, unknown>) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Loading overlay states
  const [isLoadingOverlayOpen, setIsLoadingOverlayOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isBackgroundProcess, setIsBackgroundProcess] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<Array<{
    label: string;
    status: "pending" | "processing" | "completed";
  }>>([
    { label: "Preparando datos", status: "pending" },
    { label: "Enviando solicitud", status: "pending" },
    { label: "Procesando en segundo plano", status: "pending" },
    { label: "Verificando estado", status: "pending" },
    { label: "Finalizando", status: "pending" }
  ]);
  
  // Helper function to update loading steps
  const updateLoadingStep = (stepIndex: number, status: "pending" | "processing" | "completed") => {
    setLoadingSteps(prevSteps => 
      prevSteps.map((step, index) => 
        index === stepIndex ? { ...step, status } : step
      )
    );
    
    // Update progress based on completed steps
    if (status === "completed") {
      const completedSteps = loadingSteps.filter((_, index) => 
        index < stepIndex || (index === stepIndex && status === "completed")
      ).length;
      
      const newProgress = Math.round((completedSteps / loadingSteps.length) * 100);
      setLoadingProgress(newProgress);
    } else if (status === "processing") {
      const completedSteps = loadingSteps.filter((_, index) => index < stepIndex).length;
      const inProgressStep = 0.5; // Count in-progress step as half complete
      
      const newProgress = Math.round(((completedSteps + inProgressStep) / loadingSteps.length) * 100);
      setLoadingProgress(newProgress);
    }
  };
  
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
          list: Array.isArray(deserializedPage.content.es.section6.list) 
            ? deserializedPage.content.es.section6.list 
            : []
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

  const handleSection5ImageUpdate = (file: File) => {
    console.log(`EditPage: Processing section5 image update:`, file.name, file.type, file.size);
    
    const reader = new FileReader();
    
    // Set up the onload handler before calling readAsDataURL
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      console.log(`EditPage: Base64 image created, length:`, base64String.length);
      
      setSection5Data(prev => {
        console.log(`EditPage: Updating section5Data with new image`);
        return {
          ...prev,
          image: base64String
        };
      });
    };
    
    // Start reading the file
    reader.readAsDataURL(file);
  };

  const handleSection5ImageRemove = () => {
    setSection5Data(prev => ({
      ...prev,
      image: "/plazareina2.jpg" // Reset to default image
    }));
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
    
    // Show loading overlay
    setIsLoadingOverlayOpen(true);
    setLoadingProgress(0);
    setIsBackgroundProcess(true);
    
    // Reset loading steps
    setLoadingSteps([
      { label: "Preparando datos", status: "pending" },
      { label: "Enviando solicitud", status: "pending" },
      { label: "Procesando en segundo plano", status: "pending" },
      { label: "Verificando estado", status: "pending" },
      { label: "Finalizando", status: "pending" }
    ]);

    try {
      // Step 1: Preparing data
      updateLoadingStep(0, "processing");
      
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
      
      // Short delay for data preparation
      await new Promise(resolve => setTimeout(resolve, 500));
      updateLoadingStep(0, "completed");
      
      // Step 2: Sending request
      updateLoadingStep(1, "processing");
      
      // Create form data
      const formData = new FormData();
      formData.append("name", pageName);
      formData.append("content", JSON.stringify(content));
      formData.append("status", status);
      formData.append("id", deserializedPage._id || "");
      
      // Set a flag to indicate this is a background processing request
      formData.append("background", "true");
      
      // Create an AbortController with a longer timeout (2 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
      
      try {
        // Send initial request to start background processing
        const response = await fetch(`/api/pages/update/${deserializedPage._id}`, {
          method: "PUT",
          body: formData,
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json() as { error?: string };
            throw new Error(errorData.error || "Error al iniciar la actualización del tour");
          } else {
            const statusText = response.statusText || "";
            const status = response.status;
            throw new Error(
              `Error del servidor (${status}): ${statusText}. No se pudo iniciar la actualización.`
            );
          }
        }
        
        // Parse the response
        const result = await response.json() as { 
          success: boolean; 
          message?: string;
          jobId?: string;
          status?: string;
        };
        
        updateLoadingStep(1, "completed");
        
        // If we have a jobId, it means the request is being processed in the background
        if (result.jobId) {
          // Step 3: Background processing
          updateLoadingStep(2, "processing");
          
          // Update the message to inform the user
          setSaveError("La actualización está en proceso. Por favor, espere hasta que se complete la traducción y el procesamiento de imágenes.");
          
          // Show a success message that indicates background processing
          setSaveSuccess(true);
          
          // Set up polling to check job status
          const pollJobStatus = async (jobId: string) => {
            try {
              const statusResponse = await fetch(`/api/pages/update/${deserializedPage._id}?jobId=${jobId}`);
              
              if (!statusResponse.ok) {
                throw new Error("Error al verificar el estado del proceso");
              }
              
              const jobStatus = await statusResponse.json() as {
                status: 'pending' | 'processing' | 'completed' | 'failed';
                message: string;
                error?: string;
              };
              
              console.log(`Job status: ${jobStatus.status}, message: ${jobStatus.message}`);
              
              // Update progress based on job status
              switch (jobStatus.status) {
                case 'pending':
                  setLoadingProgress(25);
                  break;
                case 'processing':
                  setLoadingProgress(50);
                  // Update the message to show what's happening
                  setSaveError(`Procesando: ${jobStatus.message}`);
                  break;
                case 'completed':
                  // Job completed successfully
                  updateLoadingStep(2, "completed");
                  updateLoadingStep(3, "completed");
                  updateLoadingStep(4, "completed");
                  setLoadingProgress(100);
                  setSaveError(null);
                  setSaveSuccess(true);
                  
                  // Short delay before navigating
                  setTimeout(() => {
                    setIsLoadingOverlayOpen(false);
                    navigate("/admin/dashboard/pagegen/editpage", { replace: true });
                  }, 2000);
                  
                  return; // Exit polling
                case 'failed':
                  // Job failed
                  setSaveError(`Error: ${jobStatus.error || "Error desconocido durante el procesamiento"}`);
                  setIsSaving(false);
                  
                  // Keep overlay open but mark steps as failed
                  updateLoadingStep(2, "completed");
                  updateLoadingStep(3, "completed");
                  updateLoadingStep(4, "completed");
                  
                  // Allow user to dismiss after a delay
                  setTimeout(() => {
                    setIsLoadingOverlayOpen(false);
                  }, 5000);
                  
                  return; // Exit polling
              }
              
              // Continue polling if job is still in progress
              if (jobStatus.status === 'pending' || jobStatus.status === 'processing') {
                setTimeout(() => pollJobStatus(jobId), 3000); // Poll every 3 seconds
              }
            } catch (error) {
              console.error("Error polling job status:", error);
              setSaveError("Error al verificar el estado del proceso. El proceso continúa en segundo plano.");
              
              // Continue polling despite errors
              setTimeout(() => pollJobStatus(jobId), 5000); // Retry after 5 seconds on error
            }
          };
          
          // Start polling
          pollJobStatus(result.jobId);
        } else {
          // If no jobId, it means the update was processed synchronously
          updateLoadingStep(2, "completed");
          updateLoadingStep(3, "completed");
          updateLoadingStep(4, "completed");
          setLoadingProgress(100);
          
          // Close the loading overlay after a short delay
          setTimeout(() => {
            setIsLoadingOverlayOpen(false);
            setSaveSuccess(true);
            
            // Navigate back to the edit page list after a short delay
            setTimeout(() => {
              navigate("/admin/dashboard/pagegen/editpage", { replace: true });
            }, 2000);
          }, 1000);
        }
      } catch (error) {
        // Handle AbortError (timeout)
        if (error instanceof DOMException && error.name === 'AbortError') {
          // Instead of showing an error, inform the user that processing continues in the background
          setSaveError("La operación está tardando más de lo esperado. Por favor, espere hasta que se complete la traducción y el procesamiento de imágenes.");
          setSaveSuccess(true);
          
          // Keep the loading overlay open
          updateLoadingStep(1, "completed");
          updateLoadingStep(2, "processing");
          
          return; // Exit early but keep overlay open
        }
        throw error; // Re-throw other errors to be caught by the outer catch
      }
    } catch (error) {
      console.error("Error saving page:", error);
      setSaveError(error instanceof Error ? error.message : "Error al guardar el tour. Por favor, inténtelo de nuevo.");
      
      // Keep the loading overlay open for a moment so the user can see the error
      setTimeout(() => {
        setIsSaving(false);
        setIsLoadingOverlayOpen(false);
      }, 3000);
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
    isLoadingOverlayOpen,
    loadingProgress,
    loadingSteps,
    isBackgroundProcess,
    setPageName,
    handleStatusChange,
    handlePriceChange,
    handleSection1Update,
    handleSection2Update,
    handleSection3ImageUpdate,
    handleSection3ImageRemove,
    handleSection4Update,
    handleSection5Update,
    handleSection5ImageUpdate,
    handleSection5ImageRemove,
    handleSection6Update,
    handleIndexSection5Update,
    handleTimelineUpdate,
    handleSavePage,
    handleCancel
  };
}; 