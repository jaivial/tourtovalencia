// Feature component: just responsible for containing UI components, fetch data and handle features and pass down props to UI components.
import { useState, useEffect } from "react";
import HeroSection from "./HeroSection";
import IndexSection2 from "./IndexSection2";
import IndexSection3 from "./IndexSection3";
import IndexFeatures from "./IndexFeatures";
import { useLanguageContext } from "~/providers/LanguageContext";
import FloatingButton from '../ui/FloatingButton';
import IndexSection6 from "./IndexSection6";
import IndexSection1 from "./IndexSection1";
import ToursSection from "./ToursSection";
import WhyChooseUs from "./WhyChooseUs";
import TravelGallery from "./TravelGallery";
import { Tour, Page } from "~/utils/db.schema.server";
import ArrowToTop from "./ArrowToTop";
import PropTypes from "prop-types";
import DynamicTourSections from "./DynamicTourSections";

// Define a serializable version of the Tour type for use with JSON
type SerializableTour = Omit<Tour, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

// Define a serializable version of the Page type for use with JSON
type SerializablePage = Omit<Page, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

interface IndexContainerProps {
  tours?: SerializableTour[];
  pages?: SerializablePage[];
}

const IndexContainer: React.FC<IndexContainerProps> = ({ tours = [], pages = [] }) => {
  const [clientWidth, setClientWidth] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const { state } = useLanguageContext();
  const heroSectionText = state.index.heroSection;  
  const indexSection1Text = state.index.indexSection1;
  const indexSection2Text = state.index.indexSection2;
  const indexSection3Text = state.index.indexSection3;
  const carouselIndexSection2 = state.index.carouselIndexSection2;
  const indexFeatures = state.index.indexFeatures;
  const floatingButtonText = state.common.bookNow;
  const toursText = state.index.toursSection;
  const whyChooseUsText = state.index.whyChooseUs;
  const travelGalleryText = state.index.travelGallery;

  // Convert serialized tours to Tour objects
  const processedTours: Tour[] = tours.map(tour => ({
    ...tour,
    createdAt: new Date(tour.createdAt),
    updatedAt: new Date(tour.updatedAt)
  }));

  // Convert serialized pages to Page objects
  const processedPages: Page[] = pages.map(page => ({
    ...page,
    createdAt: new Date(page.createdAt),
    updatedAt: new Date(page.updatedAt)
  }));

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
      <DynamicTourSections width={clientWidth} tours={processedTours} pages={processedPages} />
      <ToursSection width={clientWidth} toursText={toursText} tours={processedTours} pages={processedPages} />
      <IndexFeatures width={clientWidth} indexFeatures={indexFeatures} />
      <WhyChooseUs width={clientWidth} whyChooseUsText={whyChooseUsText} />
      <IndexSection1 width={clientWidth} height={clientHeight} indexSection1Text={indexSection1Text} />
      {/* <TravelGallery width={clientWidth} galleryText={travelGalleryText} /> */}
      {/* <IndexSection3 width={clientWidth} indexSection3Text={indexSection3Text} /> */}
      <IndexSection2 width={clientWidth} height={clientHeight} indexSection2Text={indexSection2Text} carouselIndexSection2={carouselIndexSection2} /> 
      <FloatingButton text={floatingButtonText} />
      <IndexSection6 />
      <ArrowToTop />
    </div>
  );
};

IndexContainer.propTypes = {
  tours: PropTypes.array,
  pages: PropTypes.array
};

export default IndexContainer;
