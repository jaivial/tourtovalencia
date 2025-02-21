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
import { useLanguageContext } from "~/providers/LanguageContext";
import { IndexSection5Type, sanJuanSection1Type, sanJuanSection3Type, sanJuansection2Type, sanJuansection4Type, sanJuanSection5Type, SanJuanSection6Type } from "~/data/data";
import { PublishModal } from './PublishModal';
import { usePublishModal, usePageCreation } from './PageTemplate.hooks';

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
  onSection5Update: (field: keyof SanJuanSection5Type, value: string) => void;
  section6Data?: SanJuanSection6Type;
  onSection6Update: (field: keyof SanJuanSection6Type, value: string) => void;
  pageName: string;
};

const PageTemplate: React.FC<PageTemplateProps> = ({ status, onStatusChange, indexSection5Data, onIndexSection5Update, section1Data, onSection1Update, section2Data, onSection2Update, section3Data, onSection3ImageUpdate, onSection3ImageRemove, section4Data, onSection4Update, section5Data, onSection5Update, section6Data, onSection6Update, pageName }) => {
  const size = useWindowSize();
  const { isModalOpen, openModal, closeModal } = usePublishModal();
  const { handleCreatePage, isCreating, status: pageCreationStatus } = usePageCreation();
  const width = size.width ?? 0;
  const { state } = useLanguageContext();
  const indexSection5Text = state.index.indexSection5;

  const handleCreatePageClick = () => {
    const pageContent = {
      section1: section1Data,
      section2: section2Data,
      section3: section3Data,
      section4: section4Data,
      section5: section5Data,
      section6: section6Data
    };

    handleCreatePage({
      name: pageName,
      content: pageContent
    });
  };

  return (
    <div className="space-y-6">
      <div className="w-full min-h-screen bg-gray-100">
        <div className="w-full max-w-7xl mx-auto p-4">
          <div className="flex flex-col items-center justify-center gap-6 mb-8 p-8 bg-white rounded-lg shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900">{pageName}</h2>

            <div className="max-w-2xl text-center space-y-2 text-gray-600">
              <p className="text-sm">Para editar el contenido, haz clic en cualquier texto que desees modificar.</p>
              <p className="text-sm">Para cambiar las imágenes, pasa el cursor sobre ellas y haz clic en el icono de la cámara.</p>
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                {status === "active" ? "Activo" : "Proximamente"}
              </Label>
              <Switch
                id="status"
                checked={status === "active"}
                onCheckedChange={onStatusChange}
              />
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
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={handleCreatePageClick}
          disabled={isCreating}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? "Creando Página..." : "Crear Página"}
        </button>
      </div>

      <PublishModal
        isOpen={isModalOpen}
        onConfirm={() => {
          // Will implement publish logic next
          closeModal();
        }}
        onCancel={closeModal}
        translations={{
          title: 'Confirmar publicación',
          description: '¿Seguro que todos los datos están correctos y quieres proceder a publicar la página?',
          confirmText: 'Sí, publicar',
          cancelText: 'Cancelar'
        }}
      />
    </div>
  );
};

export default PageTemplate;
