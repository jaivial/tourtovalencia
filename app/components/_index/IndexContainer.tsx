// Feature component: just responsible for containing UI components, fetch data and handle features and pass down props to UI components.
import { useState, useEffect } from "react";
import HeroSection from "./HeroSection";
import IndexSection2 from "./IndexSection2";
import IndexFeatures from "./IndexFeatures";
import { useLanguageContext } from "~/providers/LanguageContext";
import FloatingButton from "../ui/FloatingButton";
import IndexSection6 from "./IndexSection6";
import IndexSection1 from "./IndexSection1";
import ToursSection from "./ToursSection";
import WhyChooseUs from "./WhyChooseUs";
import ArrowToTop from "./ArrowToTop";
import PropTypes from "prop-types";
import DynamicTourSections from "./DynamicTourSections";

// Define types for the props that accept JSON serialized data
interface IndexContainerProps {
  tours?: Record<string, unknown>[];
  pages?: Record<string, unknown>[];
}

const IndexContainer: React.FC<IndexContainerProps> = ({ tours = [], pages = [] }) => {
  const [clientWidth, setClientWidth] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const { state } = useLanguageContext();
  const heroSectionText = state.index.heroSection;
  const indexSection1Text = state.index.indexSection1;
  const indexSection2Text = state.index.indexSection2;
  const carouselIndexSection2 = state.index.carouselIndexSection2;
  const indexFeatures = state.index.indexFeatures;
  const floatingButtonText = state.common.bookNow;
  const toursText = state.index.toursSection;
  const whyChooseUsText = state.index.whyChooseUs;

  // Process tours data
  const processedTours = tours.map((tour) => ({
    ...tour,
    createdAt: new Date(tour.createdAt as string),
    updatedAt: new Date(tour.updatedAt as string),
  }));

  // Process pages data
  const processedPages = pages.map((page) => ({
    ...page,
    createdAt: new Date(page.createdAt as string),
    updatedAt: new Date(page.updatedAt as string),
  }));

  useEffect(() => {
    setIsMounted(true);
    const updateSize = () => {
      setClientWidth(window.innerWidth);
      setClientHeight(window.innerHeight);
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    // Add fade-in effect after a short delay
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 200);

    return () => {
      window.removeEventListener("resize", updateSize);
      clearTimeout(timer);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden transition-opacity duration-1000 ease-in-out ${fadeIn ? "opacity-100" : "opacity-0"}`}>
      <HeroSection width={clientWidth} height={clientHeight} heroSectionText={heroSectionText} />
      <DynamicTourSections width={clientWidth} tours={processedTours} pages={processedPages} />
      <ToursSection width={clientWidth} toursText={toursText} tours={processedTours} pages={processedPages} />
      <IndexFeatures width={clientWidth} indexFeatures={indexFeatures} />
      <WhyChooseUs width={clientWidth} whyChooseUsText={whyChooseUsText} />
      <IndexSection1 width={clientWidth} height={clientHeight} indexSection1Text={indexSection1Text} />
      <IndexSection2 width={clientWidth} height={clientHeight} indexSection2Text={indexSection2Text} carouselIndexSection2={carouselIndexSection2} />
      <FloatingButton text={floatingButtonText} />
      <IndexSection6 />
      <ArrowToTop />
    </div>
  );
};

IndexContainer.propTypes = {
  tours: PropTypes.array,
  pages: PropTypes.array,
};

export default IndexContainer;
