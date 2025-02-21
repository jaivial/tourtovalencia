import { useWindowSize } from "@uidotdev/usehooks";
import { Switch } from "@heroui/switch";
import { Label } from "~/components/ui/label";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import EditableIndexSection5 from "./EditableIndexSection5";
import EditableSanJuanSection1 from "./EditableSanJuanSection1";
import EditableSanJuanSection2 from "./EditableSanJuanSection2";
import EditableSanJuanSection3 from "./EditableSanJuanSection3";
import EditableSanJuanSection4 from "./EditableSanJuanSection4";
import EditableSanJuanSection5 from "./EditableSanJuanSection5";
import { useLanguageContext } from "~/providers/LanguageContext";
import { IndexSection5Type, sanJuanSection1Type, sanJuanSection3Type, sanJuansection2Type, sanJuansection4Type, sanJuanSection5Type } from "~/data/data";

export type PageTemplateProps = {
  status: 'active' | 'upcoming';
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
};

const PageTemplate: React.FC<PageTemplateProps> = ({
  status,
  onStatusChange,
  indexSection5Data,
  onIndexSection5Update,
  section1Data,
  onSection1Update,
  section2Data,
  onSection2Update,
  section3Data,
  onSection3ImageUpdate,
  onSection3ImageRemove,
  section4Data,
  onSection4Update,
  section5Data,
  onSection5Update
}) => {
  const size = useWindowSize();
  const width = size.width ?? 0;
  const { state } = useLanguageContext();
  const indexSection5Text = state.index.indexSection5;

  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden gap-12 pt-[100px]">
      <div className="w-full flex justify-center px-4">
        <div className="w-full max-w-4xl flex items-center justify-end space-x-2">
          <Switch checked={status === "active"} onChange={onStatusChange} className={`${status === "active" ? "bg-blue-900" : "bg-gray-200"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}>
            <span className={`${status === "active" ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
          </Switch>
          <Label htmlFor="page-status">{status === "active" ? "Activo" : "Proximamente"}</Label>
        </div>
      </div>

      <div className="w-full flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12">
        {indexSection5Data && onIndexSection5Update && (
          <EditableIndexSection5 width={width} data={indexSection5Data} onUpdate={onIndexSection5Update} />
        )}

        {section1Data && <EditableSanJuanSection1 width={width} data={section1Data} onUpdate={onSection1Update} />}

        {section2Data && <EditableSanJuanSection2 width={width} height={0} data={section2Data} onUpdate={onSection2Update} />}

        {section3Data && <EditableSanJuanSection3 width={width} data={section3Data} onImageUpdate={onSection3ImageUpdate} onImageRemove={onSection3ImageRemove} />}

        {section4Data && <EditableSanJuanSection4 width={width} data={section4Data} onUpdate={onSection4Update} />}

        {section5Data && <EditableSanJuanSection5 width={width} data={section5Data} onUpdate={onSection5Update} />}
      </div>
    </div>
  );
};

export default PageTemplate;
