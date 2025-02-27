// UI Component: just responsible for displaying pure html with props passed from feature component
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { Camera, Info } from "lucide-react";
import { useLanguageContext } from "~/providers/LanguageContext";
import PropTypes from "prop-types";

type GalleryImage = {
  src: string;
  alt: string;
  location: string;
};

type TravelGalleryProps = {
  width: number;
  galleryText: {
    title: string;
    subtitle: string;
    viewAllButton: string;
    shareButton: string;
    infoButton: string;
  };
};

const TravelGallery: React.FC<TravelGalleryProps> = ({ width, galleryText }) => {
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const { state } = useLanguageContext();
  const language = state.currentLanguage === "English" ? "en" : "es";

  // Gallery images
  const images: GalleryImage[] = [
    {
      src: "https://www.spain.info/export/sites/segtur/.content/images/cabeceras-grandes/comunidad-valenciana/ciudad-artes-ciencias-noche-valencia-pexel256150.jpg",
      alt: "City of Arts and Sciences",
      location: language === "en" ? "City of Arts and Sciences" : "Ciudad de las Artes y las Ciencias"
    },
    {
      src: "https://covesdesantjosep.es/wp-content/uploads/2023/05/banner-coves-covesdesantjosep-2023.jpg",
      alt: "Cuevas de San José",
      location: "Cuevas de San José"
    },
    {
      src: "https://mediaim.expedia.com/destination/9/f1cedf5105d3f0679eb01587b6bb4b72.jpg",
      alt: "Valencia Cathedral",
      location: language === "en" ? "Valencia Cathedral" : "Catedral de Valencia"
    },
    {
      src: "https://images.unsplash.com/photo-1541971897566-308cf7ad0934?q=80&w=4140&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Wine Experience in Valencia",
      location: language === "en" ? "Wine Experience in Valencia" : "Experiencia de Vino en Valencia"
    },
    {
      src: "https://cdn.getyourguide.com/img/tour/93401d6e4a87171fbac4dec20f4ba387f8153018f7535ad68e63541cae889af4.jpg/146.jpg",
      alt: "Albufera de Valencia",
      location: "Albufera de Valencia"
    },
    {
      src: "https://images.unsplash.com/photo-1624396372026-dac58b4fb3b8?q=80&w=3157&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Torres de Serranos",
      location: language === "en" ? "Torres de Serranos" : "Torres de Serranos"
    }
  ];

  const handleImageClick = (index: number) => {
    setActiveImage(activeImage === index ? null : index);
  };

  // Function to scroll to the Tours section
  const scrollToToursSection = () => {
    const toursSection = document.querySelector('.tours-section');
    if (toursSection) {
      toursSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full py-20 bg-blue-50 overflow-hidden">
      <div className="w-[95%] max-w-[1280px] mx-auto" ref={galleryRef}>
        {/* Header */}
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
            {galleryText.title}
          </h2>
          <p className={`
            text-blue-700 max-w-2xl mx-auto
            ${width <= 640 ? "text-base" : "text-lg"}
          `}>
            {galleryText.subtitle}
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className={`grid ${width <= 768 ? "grid-cols-1 gap-6" : width <= 1024 ? "grid-cols-2 gap-6" : "grid-cols-3 gap-6"}`}>
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className={`relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 
                ${activeImage === index ? 'ring-4 ring-blue-500 scale-[1.02]' : ''}
              `}
              onClick={() => handleImageClick(index)}
            >
              <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                
                {/* Location Badge */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex items-center">
                    <Camera className="w-4 h-4 text-white mr-2" />
                    <p className="text-white font-medium text-sm">{image.location}</p>
                  </div>
                </div>
              </div>

              {/* Expanded Info (shows when active) */}
              {activeImage === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-4"
                >
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-gray-600 text-sm">
                      {language === "en" 
                        ? "This location is featured in our guided tours. Click to learn more about our experiences in this beautiful place."
                        : "Esta ubicación forma parte de nuestros tours guiados. Haz clic para obtener más información sobre nuestras experiencias en este hermoso lugar."
                      }
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
            onClick={scrollToToursSection}
            aria-label={galleryText.viewAllButton}
          >
            {galleryText.viewAllButton}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

TravelGallery.propTypes = {
  width: PropTypes.number.isRequired,
  galleryText: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    viewAllButton: PropTypes.string.isRequired,
    shareButton: PropTypes.string.isRequired,
    infoButton: PropTypes.string.isRequired
  }).isRequired
};

export default TravelGallery; 