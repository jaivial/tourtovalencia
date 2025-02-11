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
  const SanJuanSection2Text = state.sanjuan.sanJuanSection2;
  const SanJuanSection4Text = state.sanjuan.sanJuanSection4;
  const SanJuanSection5Text = state.sanjuan.sanJuanSection5;
  const SanJuanSection6Text = state.sanjuan.sanJuanSection6;

  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn">
      <SanJuanSection2 width={width} height={height} SanJuanSection2Text={SanJuanSection2Text} />
      <SanJuanSection3 width={width} />
      <SanJuanSection4 width={width} SanJuanSection4Text={SanJuanSection4Text} />
      <SanJuanSection5 width={width} SanJuanSection5Text={SanJuanSection5Text} />
      <SanJuanSection6 width={width} SanJuanSection6Text={SanJuanSection6Text} />
    </div>
  );
};

export default SanJuanContainer;
