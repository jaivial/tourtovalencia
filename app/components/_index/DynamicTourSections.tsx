// Feature component: responsible for displaying SanJuanSection1 for each tour
import { useMemo } from "react";
import { Tour, Page } from "~/utils/db.schema.server";
import { useLanguageContext } from "~/providers/LanguageContext";
import SanJuanSection1 from "../_sanjuan/SanJuanSection1";
import { motion } from "framer-motion";
import { sanJuanSection1Type } from "~/data/data";

type DynamicTourSectionsProps = {
  width: number;
  tours?: Tour[];
  pages?: Page[];
};

const DynamicTourSections: React.FC<DynamicTourSectionsProps> = ({ width, tours = [], pages = [] }) => {
  const { state } = useLanguageContext();
  const language = state.currentLanguage === "English" ? "en" : "es";
  
  // Get tour sections data
  const tourSections = useMemo(() => {
    if (!tours.length || !pages.length) return [];
    
    return tours
      .filter(tour => tour.status === "active") // Only show active tours
      .map(tour => {
        // Find the corresponding page for this tour
        const page = pages.find(p => p._id === tour.pageId || p.slug === tour.slug);
        
        if (!page || !page.content) return null;
        
        // Get the section1 data from the page content
        const section1Data = page.content[language]?.section1 || page.content.es?.section1;
        
        if (!section1Data) return null;
        
        return {
          tour,
          section1Data
        };
      })
      .filter(Boolean); // Remove null entries
  }, [tours, pages, language]);

  if (!tourSections.length) return null;

  return (
    <div className="w-full py-16 bg-blue-50">
      <div className="w-[95%] max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className={`
            font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent mb-4
            ${width <= 640 ? "text-3xl" : "text-4xl"}
          `}>
            {language === "en" ? "Explore Our Experiences" : "Explora Nuestras Experiencias"}
          </h2>
          <p className="text-blue-800 max-w-3xl mx-auto">
            {language === "en" 
              ? "Discover the unique experiences we offer in Valencia and its surroundings" 
              : "Descubre las experiencias únicas que ofrecemos en Valencia y sus alrededores"}
          </p>
        </motion.div>

        <div className="space-y-16">
          {tourSections.map((section, index) => (
            <motion.div
              key={section.tour._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <SanJuanSection1 
                width={width} 
                sanJuanSection1Text={section.section1Data as sanJuanSection1Type} 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DynamicTourSections; 