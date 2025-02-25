// Feature component: just responsible for containing UI components, fetch data and handle features and pass down props to UI components.
import SanJuanSection1 from "./SanJuanSection1";
import SanJuanSection2 from "./SanJuanSection2";
import SanJuanSection3 from "./SanJuanSection3";
import SanJuanSection4 from "./SanJuanSection4";
import SanJuanSection5 from "./SanJuanSection5";
import SanJuanSection6 from "./SanJuanSection6";
import IndexSection5 from "../_index/IndexSection5";
import { useEffect, useState } from "react";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useClientOnly } from "~/hooks/useClientOnly";

const SanJuanContainer: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { state } = useLanguageContext();
  const isClient = useClientOnly();

  useEffect(() => {
    if (isClient) {
      const updateDimensions = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [isClient]);

  const sanJuanSection1Text = state.sanjuan.sanJuanSection1;
  const SanJuanSection2Text = state.sanjuan.sanJuanSection2;
  const SanJuanSection4Text = state.sanjuan.sanJuanSection4;
  const SanJuanSection5Text = state.sanjuan.sanJuanSection5;
  const SanJuanSection6Text = state.sanjuan.sanJuanSection6;
  const indexSection5Text = state.index.indexSection5;

  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12 pt-[100px]">
      <IndexSection5 width={dimensions.width} indexSection5Text={indexSection5Text} />
      <SanJuanSection1 width={dimensions.width} sanJuanSection1Text={sanJuanSection1Text} />
      <SanJuanSection2 width={dimensions.width} height={dimensions.height} SanJuanSection2Text={SanJuanSection2Text} />
      <SanJuanSection3 width={dimensions.width} />
      <SanJuanSection4 width={dimensions.width} SanJuanSection4Text={SanJuanSection4Text} />
      <SanJuanSection5 width={dimensions.width} SanJuanSection5Text={SanJuanSection5Text} />
      <SanJuanSection6 width={dimensions.width} SanJuanSection6Text={SanJuanSection6Text} />
    </div>
  );
};

export default SanJuanContainer;
