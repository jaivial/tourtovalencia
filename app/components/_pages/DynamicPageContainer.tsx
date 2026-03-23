import { useWindowSize } from "@uidotdev/usehooks";
import SanJuanSection1 from "../_sanjuan/SanJuanSection1";
import SanJuanSection2 from "../_sanjuan/SanJuanSection2";
import SanJuanSection3 from "../_sanjuan/SanJuanSection3";
import SanJuanSection4 from "../_sanjuan/SanJuanSection4";
import SanJuanSection5 from "../_sanjuan/SanJuanSection5";
import SanJuanSection6 from "../_sanjuan/SanJuanSection6";
import ComingSoonCard from "../_cards/ComingSoonCard";
import IndexSection5 from "../_index/IndexSection5";
import TimelineSection from "./TimelineSection";
import { useLanguageContext } from "~/providers/LanguageContext";
import type { Page } from "~/utils/db.schema.server";
import { buildWhatsAppUrl, normalizeInfoRequestContact } from "~/utils/whatsapp";
import type { SectionOrderItem } from "~/data/data";

interface DynamicPageContainerProps {
  page: Page;
}

const getOrderedSections = (sectionOrder?: SectionOrderItem[]): SectionOrderItem[] => {
  if (!sectionOrder) return [];
  return [...sectionOrder].sort((a, b) => a.order - b.order);
};

// Create a component with named exports
const DynamicPageContainer = ({ page }: DynamicPageContainerProps) => {
  const size = useWindowSize();
  const width = size.width ?? 0;
  const height = size.height ?? 0;
  const { state } = useLanguageContext();
  
  // Map display language to language code
  const languageMap: Record<string, string> = {
    Español: "es",
    English: "en",
  };

  // Get the language code from the current display language
  const languageCode = languageMap[state.currentLanguage] || "es";

   // Get content based on current language, fallback to Spanish
   const content = (page.content[languageCode as keyof typeof page.content] || page.content.es) as any;
  const hasPrice = typeof content?.hasPrice === "boolean" ? content.hasPrice : true;
  const fallbackContent = page.content.es as Record<string, unknown>;
  const infoRequestContact = normalizeInfoRequestContact(content?.infoRequestContact ?? fallbackContent?.infoRequestContact);
  const infoRequestUrl = buildWhatsAppUrl(infoRequestContact);
  const isInfoRequestWhatsAppOnly = !hasPrice && infoRequestContact.enablePhone && !infoRequestContact.enableEmail;
  const infoRequestLabel = languageCode === "en" ? "Request information" : "Solicitar información";
  const missingInfoContactText =
    languageCode === "en"
      ? "Information requests are temporarily unavailable for this service."
      : "La solicitud de información no está disponible temporalmente para este servicio.";

  const orderedSections = getOrderedSections(content.sectionOrder);

  if (content.sectionOrder && orderedSections.length > 0) {
    const renderSection = (section: SectionOrderItem) => {
      const { id } = section;
      switch (id) {
        case 'indexSection5':
          return <IndexSection5 key={id} width={width} indexSection5Text={content.indexSection5} />;
        case 'section1':
          return <SanJuanSection1 key={id} width={width} sanJuanSection1Text={content.section1} />;
        case 'section2':
          return <SanJuanSection2 key={id} width={width} height={height} SanJuanSection2Text={content.section2} />;
        case 'section3':
          return <SanJuanSection3 key={id} width={width} />;
        case 'section4':
          return <SanJuanSection4 key={id} width={width} SanJuanSection4Text={content.section4} />;
        case 'section5':
          return <SanJuanSection5 key={id} width={width} SanJuanSection5Text={content.section5} />;
        case 'section6':
          return page.status === "upcoming" ? (
            <ComingSoonCard key={id} width={width} />
          ) : (
            <SanJuanSection6
              key={id}
              width={width}
              SanJuanSection6Text={{ ...content.section6, list: content.section6?.list?.filter((item: any) => item.enabled !== false) || [] }}
              isInfoRequestOnly={isInfoRequestWhatsAppOnly}
              infoRequestUrl={infoRequestUrl}
              infoRequestLabel={infoRequestLabel}
              missingInfoContactText={missingInfoContactText}
            />
          );
        case 'timeline':
          return <TimelineSection key={id} width={width} timelineData={content.timeline} />;
        default:
          return null;
      }
    };

    return (
      <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12 pt-[100px]">
        {orderedSections.filter(s => s.enabled).map(renderSection)}
      </div>
    );
  }

  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12 pt-[100px]">
      {content.indexSection5 && <IndexSection5 width={width} indexSection5Text={content.indexSection5} />}

      {content.section1 && <SanJuanSection1 width={width} sanJuanSection1Text={content.section1} />}

      {content.section2 && <SanJuanSection2 width={width} height={height} SanJuanSection2Text={content.section2} />}

      {content.section3 && <SanJuanSection3 width={width} />}

      {content.section4 && <SanJuanSection4 width={width} SanJuanSection4Text={content.section4} />}

      {content.timeline && <TimelineSection width={width} timelineData={content.timeline} />}

      {content.section5 && <SanJuanSection5 width={width} SanJuanSection5Text={content.section5} />}

      {content.section6 && (
        page.status === "upcoming" ? (
          <ComingSoonCard width={width} />
        ) : (
          <SanJuanSection6
            width={width}
            SanJuanSection6Text={content.section6}
            isInfoRequestOnly={isInfoRequestWhatsAppOnly}
            infoRequestUrl={infoRequestUrl}
            infoRequestLabel={infoRequestLabel}
            missingInfoContactText={missingInfoContactText}
          />
        )
      )}
    </div>
  );
};

// Add named exports as properties of the component
DynamicPageContainer.Section1 = SanJuanSection1;
DynamicPageContainer.Section2 = SanJuanSection2;
DynamicPageContainer.Section3 = SanJuanSection3;
DynamicPageContainer.Section4 = SanJuanSection4;
DynamicPageContainer.Section5 = SanJuanSection5;
DynamicPageContainer.Section6 = SanJuanSection6;
DynamicPageContainer.IndexSection = IndexSection5;
DynamicPageContainer.Timeline = TimelineSection;

export default DynamicPageContainer;
