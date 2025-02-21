import { useWindowSize } from "@uidotdev/usehooks";
import { Switch } from "@heroui/switch";
import { Label } from "~/components/ui/label";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import IndexSection5 from "../_index/IndexSection5";
import EditableSanJuanSection1 from "./EditableSanJuanSection1";
import { useLanguageContext } from "~/providers/LanguageContext";
import { sanJuanSection1Type } from "~/data/data";

export type PageTemplateProps = {
  status: 'active' | 'upcoming';
  onStatusChange: (value: boolean) => void;
  section1Data: sanJuanSection1Type;
  onSection1Update: (field: keyof sanJuanSection1Type, value: string) => void;
};

const PageTemplate: React.FC<PageTemplateProps> = ({
  status,
  onStatusChange,
  section1Data,
  onSection1Update,
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

      <IndexSection5 width={width} indexSection5Text={indexSection5Text} />
      
      <EditableSanJuanSection1
        width={width}
        data={section1Data}
        onUpdate={onSection1Update}
      />
    </div>
  );
};

export default PageTemplate;
