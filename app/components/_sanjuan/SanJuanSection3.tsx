// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "~/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "~/components/ui/carousel";
import { motion, useInView } from "framer-motion";
import ImageGalleryModal from "../ui/ImageGalleryModal";
import { useLanguageContext } from "~/providers/LanguageContext";

// Child Props type
type ChildProps = {
  width: number;
};

const SanJuanSection3: React.FC<ChildProps> = ({ width }) => {
  const { state } = useLanguageContext();
  const { images } = state.sanjuan.sanJuanSection3;
  
  const plugin = React.useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));
  const ref = React.useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  const imageUrls = images.map(img => img.source);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setModalOpen(true);
  };

  return (
    <>
      <div className="w-full overflow-x-hidden">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? 
            { opacity: 1, y: 0 } : 
            { opacity: 0, y: 50 }
          }
          transition={{ duration: 0.8 }}
          className="w-[95%] max-w-[1280px] mx-auto relative z-[1] px-4"
        >
          {width > 580 ? (
            <div className="grid grid-cols-4 grid-rows-3 gap-4 h-[900px] my-10">
              {/* First two rows - existing layout */}
              {/* Large image spanning 2 rows */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer"
                onClick={() => handleImageClick(0)}
              >
                <img 
                  src={images[0].source}
                  alt={images[0].alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>

              {/* Top right image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="col-span-2 relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer"
                onClick={() => handleImageClick(1)}
              >
                <img 
                  src={images[1].source}
                  alt={images[1].alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>

              {/* Bottom right images of first section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer"
                onClick={() => handleImageClick(2)}
              >
                <img 
                  src={images[2].source}
                  alt={images[2].alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer"
                onClick={() => handleImageClick(3)}
              >
                <img 
                  src={images[3].source}
                  alt={images[3].alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>

              {/* Third row - new images */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="col-span-2 relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer"
                onClick={() => handleImageClick(4)}
              >
                <img 
                  src={images[4].source}
                  alt={images[4].alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="col-span-2 relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer"
                onClick={() => handleImageClick(5)}
              >
                <img 
                  src={images[5].source}
                  alt={images[5].alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? 
                { opacity: 1, y: 0 } : 
                { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center justify-center py-8 w-full rounded-2xl"
            >
              <Carousel 
                plugins={[plugin.current]} 
                className="w-full max-w-[90vw]"
                onMouseEnter={plugin.current.stop} 
                onMouseLeave={plugin.current.reset}
              >
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-1 cursor-pointer"
                        onClick={() => handleImageClick(index)}
                      >
                        <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-all">
                          <CardContent className="p-0 aspect-square">
                            <img
                              src={image.source}
                              alt={image.alt}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </CardContent>
                        </Card>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </motion.div>
          )}
        </motion.div>
      </div>

      <ImageGalleryModal
        images={imageUrls}
        initialIndex={selectedImageIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default SanJuanSection3;
