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
import EditableSanJuanSection6 from "./EditableSanJuanSection6";
import { useLanguageContext } from "~/providers/LanguageContext";
import { IndexSection5Type, sanJuanSection1Type, sanJuanSection3Type, sanJuansection2Type, sanJuansection4Type, sanJuanSection5Type, SanJuanSection6Type } from "~/data/data";

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
  onSection5Update: (field: keyof SanJuanSection5Type, value: string) => void;
  section6Data?: SanJuanSection6Type;
  onSection6Update: (field: keyof SanJuanSection6Type, value: string) => void;
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
  onSection5Update,
  section6Data,
  onSection6Update
}) => {
  const size = useWindowSize();
  const width = size.width ?? 0;
  const { state } = useLanguageContext();
  const indexSection5Text = state.index.indexSection5;

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-end gap-2 mb-8 p-4 bg-white rounded-lg shadow-sm">
          <Label htmlFor="status" className="text-sm font-medium text-gray-700">
            {status === 'active' ? 'Active' : 'Coming Soon'}
          </Label>
          <Switch
            id="status"
            checked={status === 'active'}
            onCheckedChange={onStatusChange}
            className={`
              ${status === 'active' ? 'bg-blue-600' : 'bg-gray-200'}
              relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors focus:outline-none focus:ring-2
              focus:ring-blue-500 focus:ring-offset-2
            `}
          >
            <span
              className={`
                ${status === 'active' ? 'translate-x-6' : 'translate-x-1'}
                inline-block h-4 w-4 transform rounded-full
                bg-white transition-transform
              `}
            />
          </Switch>
        </div>

        <div className="w-full flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12">
          {indexSection5Data && onIndexSection5Update && (
            <EditableIndexSection5 width={width} data={indexSection5Data} onUpdate={onIndexSection5Update} />
          )}

          {section1Data && <EditableSanJuanSection1 width={width} data={section1Data} onUpdate={onSection1Update} />}

          {section2Data && <EditableSanJuanSection2 width={width} height={0} data={section2Data} onUpdate={onSection2Update} />}

          {section3Data && <EditableSanJuanSection3 width={width} data={section3Data} onUpdate={onSection3ImageUpdate} onRemove={onSection3ImageRemove} />}

          {section4Data && <EditableSanJuanSection4 width={width} data={section4Data} onUpdate={onSection4Update} />}

          {section5Data && <EditableSanJuanSection5 width={width} data={section5Data} onUpdate={onSection5Update} />}

          {section6Data && <EditableSanJuanSection6 width={width} data={section6Data} onUpdate={onSection6Update} />}
        </div>
      </div>
    </div>
  );
};

export default PageTemplate;
