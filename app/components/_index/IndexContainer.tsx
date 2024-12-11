// Feature component: just responsible for containing UI components, fetch data and handle features and pass down props to UI components.
import HeroSection from "./HeroSection";
import IndexSection1 from "./IndexSection1";
import IndexSection2 from "./IndexSection2";
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
  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-orange-50">
      <HeroSection width={width} height={height} heroSectionText={heroSectionText} />
      <IndexSection1 width={width} height={height} indexSection1Text={indexSection1Text} />
      <IndexSection2 width={width} height={height} indexSection2Text={indexSection2Text} />
    </div>
  );
};

export default IndexContainer;
