// Feature component: just responsible for containing UI components, fetch data and handle features and pass down props to UI components.
import { useState, useEffect } from "react";
import HeroSection from "./HeroSection";
import IndexSection2 from "./IndexSection2";
import IndexSection3 from "./IndexSection3";
import IndexSection5 from "./IndexSection5";
import IndexFeatures from "./IndexFeatures";
import SanJuanSection1 from "../_sanjuan/SanJuanSection1";
import SanJuanSection2 from "../_sanjuan/SanJuanSection2";
import SanJuanSection3 from "../_sanjuan/SanJuanSection3";
import SanJuanSection5 from "../_sanjuan/SanJuanSection5";
import SanJuanSection6 from "../_sanjuan/SanJuanSection6";
import { useLanguageContext } from "~/providers/LanguageContext";
import FloatingButton from '../ui/FloatingButton';
import { TimelineFeature } from "./TimelineFeature";
import IndexSection6 from "./IndexSection6";
import IndexSection1 from "./IndexSection1";
const IndexContainer: React.FC = () => {
  const [clientWidth, setClientWidth] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const { state } = useLanguageContext();
  const heroSectionText = state.index.heroSection;  
  const indexSection1Text = state.index.indexSection1;
  const indexSection2Text = state.index.indexSection2;
  const indexSection3Text = state.index.indexSection3;
  const carouselIndexSection2 = state.index.carouselIndexSection2;
  const indexSection5Text = state.index.indexSection5;
  const indexFeatures = state.index.indexFeatures;
  const sanJuanSection1Text = state.sanjuan.sanJuanSection1;
  const SanJuanSection2Text = state.sanjuan.sanJuanSection2;

  const SanJuanSection5Text = state.sanjuan.sanJuanSection5;
  const SanJuanSection6Text = state.sanjuan.sanJuanSection6;
  const floatingButtonText = state.common.bookNow;

  useEffect(() => {
    setIsMounted(true);
    const updateSize = () => {
      setClientWidth(window.innerWidth);
      setClientHeight(window.innerHeight);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn">
      <HeroSection width={clientWidth} height={clientHeight} heroSectionText={heroSectionText} />
      <IndexSection1 width={clientWidth} height={clientHeight} indexSection1Text={indexSection1Text} />
      {/* <IndexSection5 width={clientWidth} indexSection5Text={indexSection5Text} />
      <SanJuanSection2 width={clientWidth} height={clientHeight} SanJuanSection2Text={SanJuanSection2Text} />
      <SanJuanSection1 width={clientWidth} sanJuanSection1Text={sanJuanSection1Text} />
      <SanJuanSection3 width={clientWidth} />
      <SanJuanSection5 width={clientWidth} SanJuanSection5Text={SanJuanSection5Text} />
      <TimelineFeature />
      <IndexFeatures width={clientWidth} indexFeatures={indexFeatures} />
      <SanJuanSection6 width={clientWidth} SanJuanSection6Text={SanJuanSection6Text} />
      <IndexSection3 width={clientWidth} indexSection3Text={indexSection3Text} />
      <IndexSection2 width={clientWidth} height={clientHeight} indexSection2Text={indexSection2Text} carouselIndexSection2={carouselIndexSection2} /> */}
      <FloatingButton text={floatingButtonText} />
      <IndexSection6 />
    </div>
  );
};

export default IndexContainer;
