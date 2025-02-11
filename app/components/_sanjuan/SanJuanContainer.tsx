// Feature component: just responsible for containing UI components, fetch data and handle features and pass down props to UI components.
import SanJuanSection2 from "./SanJuanSection2";
import SanJuanSection3 from "./SanJuanSection3";
import SanJuanSection4 from "./SanJuanSection4";
import SanJuanSection5 from "./SanJuanSection5";
import SanJuanSection6 from "./SanJuanSection6";
import { useWindowSize } from "@uidotdev/usehooks";
import { useLanguageContext } from "~/providers/LanguageContext";

const SanJuanContainer: React.FC = () => {
  const size = useWindowSize();
  const width = size.width ?? 0;
  const height = size.height ?? 0;
  const { state } = useLanguageContext();
  const indexSection2Text = state.index.indexSection2;
  const indexSection4Text = state.index.indexSection4;
  const indexSection5Text = state.index.indexSection5;
  const indexSection6Text = state.index.indexSection6;

  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn">
      <SanJuanSection2 width={width} height={height} indexSection2Text={indexSection2Text} />
      <SanJuanSection3 width={width} />
      <SanJuanSection4 width={width} indexSection4Text={indexSection4Text} />
      <SanJuanSection5 width={width} indexSection5Text={indexSection5Text} />
      <SanJuanSection6 width={width} indexSection6Text={indexSection6Text} />
    </div>
  );
};

export default SanJuanContainer;
