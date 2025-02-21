import { useWindowSize } from "@uidotdev/usehooks";
import { Switch } from "@heroui/switch";
import { Label } from "~/components/ui/label";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import EditableIndexSection5 from "./EditableIndexSection5";
import EditableSanJuanSection1 from "./EditableSanJuanSection1";
import EditableSanJuanSection2 from "./EditableSanJuanSection2";
import EditableSanJuanSection3 from "./EditableSanJuanSection3";
import { useLanguageContext } from "~/providers/LanguageContext";
import { IndexSection5Type, sanJuanSection1Type, sanJuanSection3Type, sanJuansection2Type } from "~/data/data";

export type PageTemplateProps = {
  status: 'active' | 'upcoming';
  onStatusChange: (value: boolean) => void;
  indexSection5Data: IndexSection5Type;
  onIndexSection5Update: (field: keyof IndexSection5Type, value: string) => void;
  section1Data: sanJuanSection1Type;
  onSection1Update: (field: keyof sanJuanSection1Type, value: string | { file?: File; preview: string }) => void;
  section2Data: sanJuansection2Type;
  onSection2Update: (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string }) => void;
  section3Data: sanJuanSection3Type;
  onSection3ImageUpdate: (index: number, file: File) => void;
  onSection3ImageRemove: (index: number) => void;
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
}) => {
  const size = useWindowSize();
  const width = size.width ?? 0;
  const { state } = useLanguageContext();
  const indexSection5Text = state.index.indexSection5;

  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden gap-12 pt-[100px]">
      <div className="w-full flex justify-center px-4">
        <div className="w-full max-w-4xl flex items-center justify-end space-x-2">
          <Switch id="page-status" checked={status === "active"} onCheckedChange={onStatusChange} />
          <Label htmlFor="page-status">{status === "active" ? "Activo" : "Proximamente"}</Label>
        </div>
      </div>

      <EditableIndexSection5
        width={width}
        data={indexSection5Data}
        onUpdate={onIndexSection5Update}
      />
      
      <EditableSanJuanSection1
        width={width}
        data={section1Data}
        onUpdate={onSection1Update}
      />

      <EditableSanJuanSection2
        width={width}
        height={0}
        SanJuanSection2Text={section2Data}
        onTextUpdate={(field, value) => onSection2Update(field, typeof value === 'string' ? value : { file: value.file, preview: value.preview })}
      />

      <EditableSanJuanSection3
        width={width}
        data={section3Data}
        onUpdate={onSection3ImageUpdate}
        onRemove={onSection3ImageRemove}
      />
    </div>
  );
};

export default PageTemplate;
