// UI Component: just responsible for displaying pure html with props passed from feature component
import { motion } from "framer-motion";
import { Link } from "@remix-run/react";
import { Tour, Page } from "~/utils/db.schema.server";
import { useLanguageContext } from "~/providers/LanguageContext";
import PropTypes from "prop-types";

type ToursSectionProps = {
  width: number;
  toursText: {
    title: string;
    subtitle: string;
    comingSoon: string;
    bookNow: string;
    viewDetails: string;
  };
  tours?: Tour[];
  pages?: Page[];
};

const ToursSection: React.FC<ToursSectionProps> = ({ width, toursText, tours = [], pages = [] }) => {
  const { state } = useLanguageContext();
  const language = state.currentLanguage === "English" ? "en" : "es";

  // Mock data for tours if none provided
  const mockTours: Tour[] = [
    {
      _id: "1",
      slug: "valencia-city-tour",
      tourName: {
        en: "Valencia City Tour",
        es: "Tour por la Ciudad de Valencia"
      },
      tourPrice: 49.99,
      status: "active",
      description: {
        en: "Explore the beautiful city of Valencia with our expert guides. Visit the City of Arts and Sciences, the historic center, and more.",
        es: "Explora la hermosa ciudad de Valencia con nuestros guías expertos. Visita la Ciudad de las Artes y las Ciencias, el centro histórico y más."
      },
      duration: {
        en: "4 hours",
        es: "4 horas"
      },
      includes: {
        en: "Guide, transportation, entrance fees",
        es: "Guía, transporte, entradas"
      },
      meetingPoint: {
        en: "Valencia North Station",
        es: "Estación del Norte de Valencia"
      },
      pageId: "page1",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: "2",
      slug: "albufera-natural-park",
      tourName: {
        en: "Albufera Natural Park",
        es: "Parque Natural de la Albufera"
      },
      tourPrice: 59.99,
      status: "active",
      description: {
        en: "Discover the natural beauty of Albufera, enjoy a traditional boat ride, and taste authentic paella in its birthplace.",
        es: "Descubre la belleza natural de la Albufera, disfruta de un paseo en barca tradicional y prueba la auténtica paella en su lugar de origen."
      },
      duration: {
        en: "5 hours",
        es: "5 horas"
      },
      includes: {
        en: "Guide, transportation, boat ride, paella lunch",
        es: "Guía, transporte, paseo en barca, almuerzo de paella"
      },
      meetingPoint: {
        en: "Plaza de la Reina",
        es: "Plaza de la Reina"
      },
      pageId: "page2",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: "3",
      slug: "wine-tasting-tour",
      tourName: {
        en: "Valencia Wine Tasting Tour",
        es: "Tour de Cata de Vinos de Valencia"
      },
      tourPrice: 79.99,
      status: "active",
      description: {
        en: "Visit local wineries and taste the best wines from the Valencia region with expert sommeliers.",
        es: "Visita bodegas locales y prueba los mejores vinos de la región de Valencia con sumilleres expertos."
      },
      duration: {
        en: "6 hours",
        es: "6 horas"
      },
      includes: {
        en: "Guide, transportation, wine tasting, snacks",
        es: "Guía, transporte, cata de vinos, aperitivos"
      },
      meetingPoint: {
        en: "Valencia Cathedral",
        es: "Catedral de Valencia"
      },
      pageId: "page3",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: "4",
      slug: "oceanografic-guided-tour",
      tourName: {
        en: "Oceanogràfic Guided Tour",
        es: "Visita Guiada al Oceanogràfic"
      },
      tourPrice: 39.99,
      status: "upcoming",
      description: {
        en: "Explore Europe's largest aquarium with our expert marine biologists and learn about ocean conservation.",
        es: "Explora el acuario más grande de Europa con nuestros biólogos marinos expertos y aprende sobre la conservación de los océanos."
      },
      duration: {
        en: "3 hours",
        es: "3 horas"
      },
      includes: {
        en: "Guide, entrance fees, special access areas",
        es: "Guía, entradas, acceso a áreas especiales"
      },
      meetingPoint: {
        en: "Oceanogràfic Main Entrance",
        es: "Entrada Principal del Oceanogràfic"
      },
      pageId: "page4",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const displayTours = tours.length > 0 ? tours : mockTours;

  // Function to get the base64 image for a tour
  const getTourImage = (tour: Tour) => {
    if (!pages || pages.length === 0) return null;
    
    // Find the page that corresponds to this tour
    const page = pages.find(p => p._id === tour.pageId || p.slug === tour.slug);
    
    if (page && 
        page.content && 
        page.content.es && 
        page.content.es.section1 && 
        page.content.es.section1.backgroundImage && 
        page.content.es.section1.backgroundImage.preview) {
      return page.content.es.section1.backgroundImage.preview;
    }
    
    return null;
  };

  return (
    <div className="w-full py-16 bg-gradient-to-b from-blue-50 to-white">
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
            {toursText.title}
          </h2>
          <p className={`
            text-blue-700 max-w-2xl mx-auto
            ${width <= 640 ? "text-base" : "text-lg"}
          `}>
            {toursText.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayTours.map((tour, index) => {
            const tourImage = getTourImage(tour);
            
            return (
              <motion.div
                key={tour._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`
                  relative rounded-xl overflow-hidden shadow-lg bg-white
                  ${tour.status === "upcoming" ? "overflow-hidden" : ""}
                `}
              >
                {/* Tour Image */}
                <div className="h-48 overflow-hidden">
                  {tourImage ? (
                    <img 
                      src={tourImage} 
                      alt={tour.tourName[language]} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  ) : (
                    <img 
                      src={`/tour-${index + 1}.jpg`} 
                      alt={tour.tourName[language]} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = "/tour-placeholder.jpg";
                      }}
                    />
                  )}
                </div>

                {/* Tour Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">{tour.tourName[language]}</h3>
                  <p className="text-blue-700 text-sm mb-4">{tour.duration[language]}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tour.description[language]}</p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-blue-800">{tour.tourPrice.toFixed(2)}€</span>
                    
                    {tour.status === "active" ? (
                      <Link 
                        to={`/book?tour=${tour.slug}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {toursText.bookNow}
                      </Link>
                    ) : (
                      <span className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                        {toursText.comingSoon}
                      </span>
                    )}
                  </div>
                </div>

                {/* Overlay for upcoming tours */}
                {tour.status === "upcoming" && (
                  <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white/90 px-6 py-4 rounded-lg text-center">
                      <p className="text-xl font-bold text-blue-900">{toursText.comingSoon}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

ToursSection.propTypes = {
  width: PropTypes.number.isRequired,
  toursText: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    comingSoon: PropTypes.string.isRequired,
    bookNow: PropTypes.string.isRequired,
    viewDetails: PropTypes.string.isRequired
  }).isRequired,
  tours: PropTypes.array,
  pages: PropTypes.array
};

export default ToursSection; 