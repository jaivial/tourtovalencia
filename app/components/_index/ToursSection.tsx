/* eslint-disable react/prop-types */
// UI Component: just responsible for displaying pure html with props passed from feature component
import { motion } from "framer-motion";
import { Link } from "@remix-run/react";
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
  tours?: any[];
  pages?: any[];
};

const ToursSection: React.FC<ToursSectionProps> = ({ width, toursText, tours = [], pages = [] }) => {
  const { state } = useLanguageContext();
  const language = state.currentLanguage === "English" ? "en" : "es";
  const perPersonText = language === "en" ? "per person" : "por persona";

  type TourImageResult = {
    url: string | null;
    hideBlock: boolean;
  };

  // Mock data for tours if none provided
  const mockTours: any[] = [
    {
      _id: "1",
      slug: "valencia-city-tour",
      tourName: {
        en: "Valencia City Tour",
        es: "Tour por la Ciudad de Valencia",
      },
      tourPrice: 49.99,
      status: "active",
      description: {
        en: "Explore the beautiful city of Valencia with our expert guides. Visit the City of Arts and Sciences, the historic center, and more.",
        es: "Explora la hermosa ciudad de Valencia con nuestros guías expertos. Visita la Ciudad de las Artes y las Ciencias, el centro histórico y más.",
      },
      duration: {
        en: "4 hours",
        es: "4 horas",
      },
      includes: {
        en: "Guide, transportation, entrance fees",
        es: "Guía, transporte, entradas",
      },
      meetingPoint: {
        en: "Valencia North Station",
        es: "Estación del Norte de Valencia",
      },
      pageId: "page1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "2",
      slug: "albufera-natural-park",
      tourName: {
        en: "Albufera Natural Park",
        es: "Parque Natural de la Albufera",
      },
      tourPrice: 59.99,
      status: "active",
      description: {
        en: "Discover the natural beauty of Albufera, enjoy a traditional boat ride, and taste authentic paella in its birthplace.",
        es: "Descubre la belleza natural de la Albufera, disfruta de un paseo en barca tradicional y prueba la auténtica paella en su lugar de origen.",
      },
      duration: {
        en: "5 hours",
        es: "5 horas",
      },
      includes: {
        en: "Guide, transportation, boat ride, paella lunch",
        es: "Guía, transporte, paseo en barca, almuerzo de paella",
      },
      meetingPoint: {
        en: "Plaza de la Reina",
        es: "Plaza de la Reina",
      },
      pageId: "page2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "3",
      slug: "wine-tasting-tour",
      tourName: {
        en: "Valencia Wine Tasting Tour",
        es: "Tour de Cata de Vinos de Valencia",
      },
      tourPrice: 79.99,
      status: "active",
      description: {
        en: "Visit local wineries and taste the best wines from the Valencia region with expert sommeliers.",
        es: "Visita bodegas locales y prueba los mejores vinos de la región de Valencia con sumilleres expertos.",
      },
      duration: {
        en: "6 hours",
        es: "6 horas",
      },
      includes: {
        en: "Guide, transportation, wine tasting, snacks",
        es: "Guía, transporte, cata de vinos, aperitivos",
      },
      meetingPoint: {
        en: "Valencia Cathedral",
        es: "Catedral de Valencia",
      },
      pageId: "page3",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "4",
      slug: "oceanografic-guided-tour",
      tourName: {
        en: "Oceanogràfic Guided Tour",
        es: "Visita Guiada al Oceanogràfic",
      },
      tourPrice: 39.99,
      status: "upcoming",
      description: {
        en: "Explore Europe's largest aquarium with our expert marine biologists and learn about ocean conservation.",
        es: "Explora el acuario más grande de Europa con nuestros biólogos marinos expertos y aprende sobre la conservación de los océanos.",
      },
      duration: {
        en: "3 hours",
        es: "3 horas",
      },
      includes: {
        en: "Guide, entrance fees, special access areas",
        es: "Guía, entradas, acceso a áreas especiales",
      },
      meetingPoint: {
        en: "Oceanogràfic Main Entrance",
        es: "Entrada Principal del Oceanogràfic",
      },
      pageId: "page4",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Sort tours to display active tours first, then upcoming tours
  const displayTours = [...(tours.length > 0 ? tours : mockTours)].sort((a, b) => {
    if (a.status === "active" && b.status === "upcoming") return -1;
    if (a.status === "upcoming" && b.status === "active") return 1;
    return 0;
  });

  // Function to get the base64 image for a tour - completely defensive
  const getTourImage = (tour: any): TourImageResult => {
    const evaluateCardImage = (card: Record<string, unknown> | undefined): TourImageResult => {
      if (!card || !Object.prototype.hasOwnProperty.call(card, "image")) {
        return { url: null, hideBlock: false };
      }

      const imageValue = card.image;
      if (imageValue === null || imageValue === "") {
        return { url: null, hideBlock: true };
      }

      if (typeof imageValue === "string") {
        return imageValue.trim().length > 0
          ? { url: imageValue, hideBlock: false }
          : { url: null, hideBlock: true };
      }

      if (typeof imageValue === "object") {
        const preview = (imageValue as Record<string, unknown>)?.preview;
        if (preview === null || preview === "") {
          return { url: null, hideBlock: true };
        }

        if (typeof preview === "string" && preview.trim().length > 0) {
          return { url: preview, hideBlock: false };
        }
      }

      return { url: null, hideBlock: false };
    };

    const evaluateSectionImage = (section1: Record<string, unknown> | undefined): TourImageResult => {
      if (!section1 || !Object.prototype.hasOwnProperty.call(section1, "backgroundImage")) {
        return { url: null, hideBlock: false };
      }

      const bgValue = section1.backgroundImage;
      if (bgValue === null || bgValue === "") {
        return { url: null, hideBlock: true };
      }

      if (typeof bgValue === "object") {
        const preview = (bgValue as Record<string, unknown>)?.preview;
        if (preview === null || preview === "") {
          return { url: null, hideBlock: true };
        }

        if (typeof preview === "string" && preview.trim().length > 0) {
          return { url: preview, hideBlock: false };
        }
      }

      return { url: null, hideBlock: false };
    };

    // Return null immediately if no pages provided
    if (!pages || pages.length === 0) return { url: null, hideBlock: false };

    // Find the page that corresponds to this tour
    const page = pages.find((p) => p._id === tour.pageId || p.slug === tour.slug);
    
    if (!page?.content) return { url: null, hideBlock: false };

    const content = page.content as Record<string, unknown>;
    const esData = content?.es as Record<string, unknown> | undefined;
    const langData = (content as Record<string, unknown>)?.[language] as Record<string, unknown> | undefined;
    
    // First try to get the card image if it exists - safe access with type assertions
    const langCardImage = (langData as Record<string, unknown> | undefined)?.card as Record<string, unknown> | undefined;
    const esCardImage = (esData as Record<string, unknown> | undefined)?.card as Record<string, unknown> | undefined;

    const langCardResult = evaluateCardImage(langCardImage);
    if (langCardResult.hideBlock || langCardResult.url) {
      return langCardResult;
    }

    const esCardResult = evaluateCardImage(esCardImage);
    if (esCardResult.hideBlock || esCardResult.url) {
      return esCardResult;
    }

    // Fallback to section1 background image
    const langSection1 = (langData as Record<string, unknown> | undefined)?.section1 as Record<string, unknown> | undefined;
    const esSection1 = (esData as Record<string, unknown> | undefined)?.section1 as Record<string, unknown> | undefined;

    const langSectionResult = evaluateSectionImage(langSection1);
    if (langSectionResult.hideBlock || langSectionResult.url) {
      return langSectionResult;
    }

    const esSectionResult = evaluateSectionImage(esSection1);
    if (esSectionResult.hideBlock || esSectionResult.url) {
      return esSectionResult;
    }

    return { url: null, hideBlock: false };
  };

  const getTourHasPrice = (tour: any): boolean => {
    if (typeof tour?.hasPrice === "boolean") {
      return tour.hasPrice;
    }

    if (!pages || pages.length === 0) {
      return true;
    }

    const page = pages.find((p) => p._id === tour.pageId || p.slug === tour.slug);
    if (!page?.content) {
      return true;
    }

    const content = page.content as Record<string, unknown>;
    const esData = content?.es as Record<string, unknown> | undefined;
    const langData = content?.[language] as Record<string, unknown> | undefined;

    if (typeof langData?.hasPrice === "boolean") {
      return langData.hasPrice;
    }

    if (typeof esData?.hasPrice === "boolean") {
      return esData.hasPrice;
    }

    return true;
  };

  // Function to get card data from the page - completely defensive
  const getCardData = (tour: any) => {
    // Return mock data immediately if no pages provided
    if (!pages || pages.length === 0) {
      return {
        title: tour.tourName?.[language] || tour.tourName?.es || '',
        duration: tour.duration?.[language] || tour.duration?.es || '',
        description: tour.description?.[language] || tour.description?.es || '',
        quote: null,
        additionalInfo: null,
      };
    }

    // Find the page that corresponds to this tour
    const page = pages.find((p) => p._id === tour.pageId || p.slug === tour.slug);

    const result = {
      title: tour.tourName?.[language] || tour.tourName?.es || '',
      duration: tour.duration?.[language] || tour.duration?.es || '',
      description: tour.description?.[language] || tour.description?.es || '',
      quote: null as string | null,
      additionalInfo: null as string | null,
    };

    // Ultra-safe access to page content
    if (!page?.content) return result;
    
    const content = page.content as Record<string, Record<string, unknown>>;
    const esData = content?.es || {};
    const langData = content?.[language] || {};

    // Try to get card data if it exists
    const cardData = (langData as Record<string, unknown>)?.card || (esData as Record<string, unknown>)?.card;

    if (cardData && typeof cardData === 'object') {
      const card = cardData as Record<string, unknown>;
      if (card.title) result.title = String(card.title);
      if (card.duration) result.duration = String(card.duration);
      if (card.description) result.description = String(card.description);
      if (card.quote) result.quote = String(card.quote);
      if (card.additionalInfo) result.additionalInfo = String(card.additionalInfo);
    } else {
      // Fallback to section2.firstH3 for quote
      const esSection2 = (esData as Record<string, unknown>)?.section2 as Record<string, unknown> | undefined;
      const langSection2 = (langData as Record<string, unknown>)?.section2 as Record<string, unknown> | undefined;
      const quoteText = langSection2?.firstH3 || esSection2?.firstH3;
      if (quoteText) result.quote = String(quoteText);

      // Fallback to indexSection5.secondH3 for additional info
      const esIndexSection5 = (esData as Record<string, unknown>)?.indexSection5 as Record<string, unknown> | undefined;
      const langIndexSection5 = (langData as Record<string, unknown>)?.indexSection5 as Record<string, unknown> | undefined;
      const additionalInfoText = langIndexSection5?.secondH3 || esIndexSection5?.secondH3;
      if (additionalInfoText) result.additionalInfo = String(additionalInfoText);
    }

    return result;
  };

  // Define button styles to prevent underlines
  const linkButtonStyle = {
    textDecoration: "none",
  };

  return (
    <div className="w-full py-20 bg-blue-50 tours-section">
      <div className="w-[95%] max-w-[1280px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-12">
          <h2
            className={`
            font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent mb-4
            ${width <= 640 ? "text-3xl" : "text-4xl"}
          `}
          >
            {toursText.title}
          </h2>
          <p
            className={`
            text-blue-700 max-w-2xl mx-auto
            ${width <= 640 ? "text-base" : "text-lg"}
          `}
          >
            {toursText.subtitle}
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8">
          {displayTours.map((tour, index) => {
            const tourImage = getTourImage(tour);
            const cardData = getCardData(tour);
            const shouldShowImageBlock = !tourImage.hideBlock;
            const hasPrice = getTourHasPrice(tour);
            const tourPrice = Number.isFinite(Number(tour.tourPrice)) ? Number(tour.tourPrice) : 0;

            return (
              <motion.div
                key={tour._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`
                  relative rounded-xl overflow-hidden shadow-lg bg-white h-[550px] flex flex-col
                  transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2
                  ${tour.status === "upcoming" ? "overflow-hidden" : ""}
                  w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-[380px]
                `}
              >
                 {shouldShowImageBlock && (
                   <div className="h-56 overflow-hidden">
                     {(() => {
                       const defaultImage = "https://images.unsplash.com/photo-1583265101492-bfe6ef35cef8?q=80&w=1000&auto=format&fit=crop";
                       return (
                         <img
                           src={tourImage.url || defaultImage}
                           alt={cardData.title}
                           className={`w-full h-full object-cover transition-transform duration-500 hover:scale-110 ${tour.status === "upcoming" ? "grayscale" : ""}`}
                           loading="lazy"
                           onError={(e) => {
                             const target = e.currentTarget as HTMLImageElement;
                             if (target.src !== defaultImage) {
                               target.src = defaultImage;
                             }
                           }}
                         />
                       );
                     })()}
                   </div>
                 )}

                {/* Tour Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">{cardData.title}</h3>

                  <div className="flex items-center mb-4 text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{cardData.duration}</p>
                  </div>

                  {cardData.quote && <p className="text-gray-700 text-sm mb-3 italic">&ldquo;{cardData.quote}&rdquo;</p>}

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{cardData.description}</p>

                  {cardData.additionalInfo && <p className="text-gray-700 text-sm mb-3 font-medium">{cardData.additionalInfo}</p>}

                  <div className="mt-auto">
                    <div className="flex flex-col space-y-4">
                      {hasPrice && (
                        <div className="flex items-center justify-center bg-blue-50 py-3 px-4 rounded-lg">
                          <span className="text-2xl font-bold text-blue-800">{Math.round(tourPrice)}€</span>
                          <span className="text-sm text-blue-600 ml-1">{perPersonText}</span>
                        </div>
                      )}

                      {/* View More Button */}
                      <div className="w-full">
                        <Link to={`/pages/${tour.slug}`} className="block w-full py-3 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center font-medium" style={linkButtonStyle}>
                          <span className="pointer-events-none">{toursText.viewDetails}</span>
                        </Link>
                      </div>

                      {tour.status === "active" ? (
                        <div className="w-full">
                          <Link to={`/book?tour=${tour.slug}`} className="block w-full py-3 bg-blue-600 text-white hover:text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium" style={linkButtonStyle}>
                            <span className="pointer-events-none text-white hover:text-white">{toursText.bookNow}</span>
                          </Link>
                        </div>
                      ) : (
                        <span className="w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed text-center font-medium">{toursText.comingSoon}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overlay for upcoming tours - more subtle version */}
                {tour.status === "upcoming" && (
                  <div className="absolute top-0 right-0 m-4">
                    <div className="bg-blue-600/90 px-4 py-2 rounded-lg text-center shadow-md">
                      <p className="text-sm font-bold text-white">{toursText.comingSoon}</p>
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
    viewDetails: PropTypes.string.isRequired,
  }).isRequired,
  tours: PropTypes.array,
  pages: PropTypes.array,
};

export default ToursSection;
