import { useWindowSize } from "@uidotdev/usehooks";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import EditableIndexSection5 from "./EditableIndexSection5";
import EditableSanJuanSection1 from "./EditableSanJuanSection1";
import EditableSanJuanSection2 from "./EditableSanJuanSection2";
import EditableSanJuanSection3 from "./EditableSanJuanSection3";
import EditableSanJuanSection4 from "./EditableSanJuanSection4";
import EditableSanJuanSection5 from "./EditableSanJuanSection5";
import EditableSanJuanSection6 from "./EditableSanJuanSection6";
import { EditableTimelineFeature, TimelineDataType } from "~/components/_index/EditableTimelineFeature";
import { useLanguageContext } from "~/providers/LanguageContext";
import { IndexSection5Type, sanJuanSection1Type, sanJuanSection3Type, sanJuansection2Type, sanJuansection4Type, sanJuanSection5Type, SanJuanSection6Type } from "~/data/data";
import { PublishModal } from "./PublishModal";
import { usePublishModal, usePageCreation } from "./PageTemplate.hooks";
import { useEffect, useState } from "react";

export type PageTemplateProps = {
  status: "active" | "upcoming";
  onStatusChange?: (checked: boolean) => void;
  indexSection5Data?: IndexSection5Type;
  onIndexSection5Update?: (field: keyof IndexSection5Type, value: string) => void;
  section1Data?: sanJuanSection1Type;
  onSection1Update: (field: keyof sanJuanSection1Type, value: string | { file?: File; preview: string }) => void;
  section2Data?: sanJuansection2Type;
  onSection2Update: (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string }) => void;
  section3Data?: sanJuanSection3Type;
  onSection3ImageUpdate: (index: number, file: File) => void;
  onSection3ImageRemove: (index: number) => void;
  section4Data?: sanJuansection4Type;
  onSection4Update: (field: keyof sanJuansection4Type, value: string) => void;
  section5Data?: sanJuanSection5Type;
  onSection5Update: (field: keyof sanJuanSection5Type, value: string) => void;
  section6Data?: SanJuanSection6Type;
  onSection6Update: (field: keyof SanJuanSection6Type, value: string) => void;
  timelineData?: TimelineDataType;
  onTimelineUpdate?: (field: keyof TimelineDataType, value: string | Array<{title: string, description: string}>) => void;
  pageName: string;
};

const PageTemplate: React.FC<PageTemplateProps> = ({ status, onStatusChange, indexSection5Data, onIndexSection5Update, section1Data, onSection1Update, section2Data, onSection2Update, section3Data, onSection3ImageUpdate, onSection3ImageRemove, section4Data, onSection4Update, section5Data, onSection5Update, section6Data, onSection6Update, timelineData, onTimelineUpdate, pageName }) => {
  const size = useWindowSize();
  const { isModalOpen, closeModal } = usePublishModal();
  const { handleCreatePage, isCreating, error } = usePageCreation();
  const width = size.width ?? 0;
  const { state } = useLanguageContext();
  const [loadingMessage, setLoadingMessage] = useState("Creando página...");

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
      timeline: timelineData
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

            <div className="flex items-center gap-3">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                {status === "active" ? "Activo" : "Proximamente"}
              </Label>
              <Switch id="status" checked={status === "active"} onCheckedChange={onStatusChange} />
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12">
          {indexSection5Data && onIndexSection5Update && <EditableIndexSection5 width={width} data={indexSection5Data} onUpdate={onIndexSection5Update} />}

          {section1Data && <EditableSanJuanSection1 width={width} data={section1Data} onUpdate={onSection1Update} />}

          {section2Data && <EditableSanJuanSection2 width={width} height={0} data={section2Data} onUpdate={onSection2Update} />}

          {section3Data && <EditableSanJuanSection3 width={width} data={section3Data} onUpdate={onSection3ImageUpdate} onRemove={onSection3ImageRemove} />}

          {section4Data && <EditableSanJuanSection4 width={width} data={section4Data} onUpdate={onSection4Update} />}

          {section5Data && <EditableSanJuanSection5 width={width} data={section5Data} onUpdate={onSection5Update} />}

          {section6Data && <EditableSanJuanSection6 width={width} data={section6Data} onUpdate={onSection6Update} />}
        </div>
      </div>
      
      {isCreating && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700 font-medium">{loadingMessage}</span>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-4 mt-8 w-full px-4">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
        <div className="flex justify-center pb-24">
          <button onClick={handleCreatePageClick} disabled={isCreating} className="px-5 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {isCreating && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isCreating ? "Creando Página..." : "Crear Página"}
          </button>
        </div>
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

      <div className="grid grid-cols-1 gap-8 mb-8">
        {timelineData && onTimelineUpdate && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Línea de Tiempo</h2>
            <EditableTimelineFeature 
              timelineData={timelineData}
              onTimelineUpdate={onTimelineUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageTemplate;
