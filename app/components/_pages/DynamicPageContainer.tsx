import { useWindowSize } from "@uidotdev/usehooks";
import SanJuanSection1 from "../_sanjuan/SanJuanSection1";
import SanJuanSection2 from "../_sanjuan/SanJuanSection2";
import SanJuanSection3 from "../_sanjuan/SanJuanSection3";
import SanJuanSection4 from "../_sanjuan/SanJuanSection4";
import SanJuanSection5 from "../_sanjuan/SanJuanSection5";
import SanJuanSection6 from "../_sanjuan/SanJuanSection6";
import IndexSection5 from "../_index/IndexSection5";
import { useLanguageContext } from "~/providers/LanguageContext";
import type { Page } from "~/utils/db.schema.server";

interface DynamicPageContainerProps {
  page: Page;
}

// Export individual sections for dynamic usage
export const Section1 = SanJuanSection1;
export const Section2 = SanJuanSection2;
export const Section3 = SanJuanSection3;
export const Section4 = SanJuanSection4;
export const Section5 = SanJuanSection5;
export const Section6 = SanJuanSection6;
export const IndexSection = IndexSection5;

const DynamicPageContainer: React.FC<DynamicPageContainerProps> = ({ page }) => {
  const size = useWindowSize();
  const width = size.width ?? 0;
  const height = size.height ?? 0;
  const { state } = useLanguageContext();
  
  // Get content based on current language, fallback to Spanish
  const content = page.content[state.language] || page.content.es;

  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12 pt-[100px]">
      {content.indexSection5 && (
        <IndexSection5 
          width={width} 
          indexSection5Text={content.indexSection5} 
        />
      )}
      
      {content.section1 && (
        <SanJuanSection1 
          width={width} 
          sanJuanSection1Text={content.section1} 
        />
      )}
      
      {content.section2 && (
        <SanJuanSection2 
          width={width} 
          height={height} 
          SanJuanSection2Text={content.section2} 
        />
      )}
      
      {content.section3 && (
        <SanJuanSection3 
          width={width} 
          images={content.section3.images}
        />
      )}
      
      {content.section4 && (
        <SanJuanSection4 
          width={width} 
          SanJuanSection4Text={content.section4} 
        />
      )}
      
      {content.section5 && (
        <SanJuanSection5 
          width={width} 
          SanJuanSection5Text={content.section5} 
        />
      )}
      
      {content.section6 && (
        <SanJuanSection6 
          width={width} 
          SanJuanSection6Text={content.section6} 
        />
      )}
    </div>
  );
};

// Attach sections to the container for dynamic usage
DynamicPageContainer.Section1 = Section1;
DynamicPageContainer.Section2 = Section2;
DynamicPageContainer.Section3 = Section3;
DynamicPageContainer.Section4 = Section4;
DynamicPageContainer.Section5 = Section5;
DynamicPageContainer.Section6 = Section6;
DynamicPageContainer.IndexSection = IndexSection;

export default DynamicPageContainer;
