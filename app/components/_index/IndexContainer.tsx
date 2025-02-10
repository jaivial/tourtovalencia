// Feature component: just responsible for containing UI components, fetch data and handle features and pass down props to UI components.
import HeroSection from "./HeroSection";
import IndexSection1 from "./IndexSection1";
import IndexSection2 from "./IndexSection2";
import IndexSection3 from "./IndexSection3";

import IndexSection4 from "../_sanjuan/SanJuanSection4";
import IndexSection5 from "../_sanjuan/SanJuanSection5";
import IndexSection6 from "../_sanjuan/SanJuanSection6";
import { useWindowSize } from "@uidotdev/usehooks";
import { useLanguageContext } from "~/providers/LanguageContext";

const IndexContainer: React.FC = () => {
  const size = useWindowSize();
  const width = size.width ?? 0;
  const height = size.height ?? 0;
  const { state } = useLanguageContext();
  const heroSectionText = state.index.heroSection;
  const indexSection1Text = state.index.indexSection1;
  const indexSection2Text = state.index.indexSection2;
  const indexSection3Text = state.index.indexSection3;
  const carouselIndexSection2 = state.index.carouselIndexSection2;
  const indexSection4Text = state.index.indexSection4;
  const indexSection5Text = state.index.indexSection5;
  const indexSection6Text = state.index.indexSection6;

  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn">
      <HeroSection width={width} height={height} heroSectionText={heroSectionText} />
      <IndexSection1 width={width} height={height} indexSection1Text={indexSection1Text} />
      <IndexSection2 width={width} height={height} indexSection2Text={indexSection2Text} carouselIndexSection2={carouselIndexSection2} />
      <IndexSection3 width={width} indexSection3Text={indexSection3Text} />
      <IndexSection4 width={width} indexSection4Text={indexSection4Text} />
      <IndexSection5 width={width} indexSection5Text={indexSection5Text} />
      <IndexSection6 width={width} indexSection6Text={indexSection6Text} />
    </div>
  );
};

export default IndexContainer;
