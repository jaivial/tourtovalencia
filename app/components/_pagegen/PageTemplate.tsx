/* eslint-disable react/prop-types */
import { useWindowSize } from "@uidotdev/usehooks";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Input } from "@heroui/input";
import EditableIndexSection5 from "./EditableIndexSection5";
import EditableSanJuanSection1 from "./EditableSanJuanSection1";
import EditableSanJuanSection2 from "./EditableSanJuanSection2";
import EditableSanJuanSection3 from "./EditableSanJuanSection3";
import EditableSanJuanSection4 from "./EditableSanJuanSection4";
import EditableSanJuanSection5 from "./EditableSanJuanSection5";
import EditableSanJuanSection6 from "./EditableSanJuanSection6";
import { EditableTimelineFeature, TimelineDataType } from "~/components/_index/EditableTimelineFeature";
import { IndexSection5Type, sanJuanSection1Type, sanJuanSection3Type, sanJuansection2Type, sanJuansection4Type, sanJuanSection5Type, SanJuanSection6Type } from "~/data/data";
import { PublishModal } from "./PublishModal";
import { usePublishModal, usePageCreation } from "./PageTemplate.hooks";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

export type PageTemplateProps = {
  status: "active" | "upcoming";
  onStatusChange?: (checked: boolean) => void;
  indexSection5Data?: IndexSection5Type;
  onIndexSection5Update?: (field: keyof IndexSection5Type, value: string) => void;
  section1Data?: sanJuanSection1Type;
  onSection1Update: (field: keyof sanJuanSection1Type, value: string | { file?: File; preview: string }) => void | Promise<void>;
  section2Data?: sanJuansection2Type;
  onSection2Update: (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string }) => void | Promise<void>;
  section3Data?: sanJuanSection3Type;
  onSection3ImageUpdate: (index: number, file: File) => void | Promise<void>;
  onSection3ImageRemove: (index: number) => void;
  section4Data?: sanJuansection4Type;
  onSection4Update: (field: keyof sanJuansection4Type, value: string) => void;
  section5Data?: sanJuanSection5Type;
  onSection5Update: (field: keyof sanJuanSection5Type, value: string) => void;
  onSection5ImageUpdate?: (file: File) => void | Promise<void>;
  onSection5ImageRemove?: () => void | Promise<void>;
  section6Data?: SanJuanSection6Type;
  onSection6Update: (field: keyof SanJuanSection6Type, value: string) => void;
  timelineData?: TimelineDataType;
  onTimelineUpdate?: (field: keyof TimelineDataType, value: string | Array<{title: string, description: string}>) => void;
  pageName: string;
  price: number;
  onPriceChange: (value: number) => void;
  isEditMode?: boolean;
};

const PageTemplate: React.FC<PageTemplateProps> = ({ status, onStatusChange, indexSection5Data, onIndexSection5Update, section1Data, onSection1Update, section2Data, onSection2Update, section3Data, onSection3ImageUpdate, onSection3ImageRemove, section4Data, onSection4Update, section5Data, onSection5Update, onSection5ImageUpdate, onSection5ImageRemove, section6Data, onSection6Update, timelineData, onTimelineUpdate, pageName, price, onPriceChange, isEditMode = false }) => {
  const size = useWindowSize();
  const { isModalOpen, closeModal } = usePublishModal();
  const { handleCreatePage, isCreating, error } = usePageCreation();
  const width = size.width ?? 0;
  const [loadingMessage, setLoadingMessage] = useState("Creando página...");

  // Add wrapper functions to handle async updates
  const handleSection1Update = async (field: keyof sanJuanSection1Type, value: string | { file?: File; preview: string }) => {
    try {
      console.log(`PageTemplate: Processing section1 update for field ${String(field)}:`, 
        typeof value === 'string' ? value : `File: ${value.file?.name || 'none'}, Preview: ${value.preview.substring(0, 30)}...`);
      
      // Call the original onSection1Update
      await onSection1Update(field, value);
    } catch (error) {
      console.error(`PageTemplate: Error updating section1 field ${String(field)}:`, error);
    }
  };

  const handleSection2Update = async (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string }) => {
    try {
      console.log(`PageTemplate: Processing section2 update for field ${String(field)}:`, 
        typeof value === 'string' ? value : `File: ${value.file?.name || 'none'}, Preview: ${value.preview.substring(0, 30)}...`);
      
      // Call the original onSection2Update
      await onSection2Update(field, value);
    } catch (error) {
      console.error(`PageTemplate: Error updating section2 field ${String(field)}:`, error);
    }
  };

  // Add a wrapper function to convert File to base64 before passing to EditableSanJuanSection3
  const handleSection3ImageUpdate = async (index: number, file: File) => {
    try {
      console.log(`PageTemplate: Processing image update for index ${index}:`, file.name, file.type, file.size);
      
      // Call the original onSection3ImageUpdate with the File
      await onSection3ImageUpdate(index, file);
    } catch (error) {
      console.error(`PageTemplate: Error updating image at index ${index}:`, error);
    }
  };

  // Add a wrapper function for section5 image update
  const handleSection5ImageUpdate = async (file: File) => {
    try {
      console.log(`PageTemplate: Processing section5 image update:`, file.name, file.type, file.size);
      
      // Call the original onSection5ImageUpdate if provided
      if (onSection5ImageUpdate) {
        await onSection5ImageUpdate(file);
      }
    } catch (error) {
      console.error(`PageTemplate: Error updating section5 image:`, error);
    }
  };

  // Add a wrapper function for section5 image removal
  const handleSection5ImageRemove = async () => {
    try {
      console.log(`PageTemplate: Processing section5 image removal`);
      
      // Call the original onSection5ImageRemove if provided
      if (onSection5ImageRemove) {
        await onSection5ImageRemove();
      }
    } catch (error) {
      console.error(`PageTemplate: Error removing section5 image:`, error);
    }
  };

  useEffect(() => {
    if (!isCreating) return;

    const messages = ["Creando página...", "Subiendo imágenes...", "Traduciendo texto..."];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingMessage(messages[currentIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isCreating]);

  const handleCreatePageClick = () => {
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

    handleCreatePage({
      name: pageName,
      content,
      status
    });
  };

  return (
    <div className="space-y-6">
      <div className="w-full min-h-screen bg-gray-100 overflow-x-hidden">
        <div className="w-full mx-auto p-4 mb-8">
          <div className="flex flex-col items-center justify-center gap-6 p-8 bg-white rounded-lg shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900">{pageName}</h2>

            <div className="max-w-2xl text-center space-y-2 text-gray-600">
              <p className="text-sm">Para editar el contenido, haz clic en cualquier texto que desees modificar.</p>
              <p className="text-sm">Para cambiar las imágenes, pasa el cursor sobre ellas y haz clic en el icono de la cámara.</p>
            </div>

            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              <div className="flex flex-col items-center gap-3">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  {status === "active" ? "Activo" : "Proximamente"}
                </Label>
                <Switch id="status" checked={status === "active"} onCheckedChange={onStatusChange} />
              </div>
              
              <div className="flex flex-col w-full sm:w-auto items-center">
                <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-1 text-center">
                  Precio
                </Label>
                <div className="relative flex justify-center">
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price.toString()}
                    onChange={(e) => onPriceChange(parseFloat(e.target.value))}
                    className="w-full sm:w-32 pl-3 pr-7 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    placeholder="0.00"
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12">
          {indexSection5Data && onIndexSection5Update && <EditableIndexSection5 width={width} data={indexSection5Data} onUpdate={onIndexSection5Update} />}

          {section1Data && <EditableSanJuanSection1 width={width} data={section1Data} onUpdate={handleSection1Update} />}

          {section2Data && <EditableSanJuanSection2 width={width} height={0} data={section2Data} onUpdate={handleSection2Update} />}

          {section3Data && <EditableSanJuanSection3 width={width} data={section3Data} onUpdate={handleSection3ImageUpdate} onRemove={onSection3ImageRemove} />}

          {section4Data && <EditableSanJuanSection4 width={width} data={section4Data} onUpdate={onSection4Update} />}

          {section5Data && <EditableSanJuanSection5 width={width} data={section5Data} onUpdate={onSection5Update} onImageUpdate={handleSection5ImageUpdate} onImageRemove={handleSection5ImageRemove} />}

          {timelineData && onTimelineUpdate && (
            <EditableTimelineFeature 
              timelineData={timelineData}
              onTimelineUpdate={onTimelineUpdate}
            />
          )}

          {section6Data && <EditableSanJuanSection6 width={width} data={section6Data} onUpdate={onSection6Update} />}
        </div>
      </div>
      
      {isCreating && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 h-[100vh] w-[100vw] mt-0" style={{ marginTop: '0px' }}>
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4 max-w-md w-full mx-4">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-700 font-medium text-lg">{loadingMessage}</span>
            </div>
            <p className="text-gray-500 text-sm text-center">Por favor, espere mientras procesamos su solicitud. Esto puede tardar unos momentos.</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-4 mt-8 w-full px-4">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
        {!isEditMode && (
          <div className="flex justify-center pb-24">
            <Button 
              onClick={handleCreatePageClick} 
              disabled={isCreating || !pageName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? 'Creando...' : 'Crear Página'}
            </Button>
          </div>
        )}
      </div>

      <PublishModal
        isOpen={isModalOpen}
        onConfirm={() => {
          // Will implement publish logic next
          closeModal();
        }}
        onCancel={closeModal}
        translations={{
          title: "Confirmar publicación",
          description: "¿Seguro que todos los datos están correctos y quieres proceder a publicar la página?",
          confirmText: "Sí, publicar",
          cancelText: "Cancelar",
        }}
      />

    </div>
  );
};

export default PageTemplate;
