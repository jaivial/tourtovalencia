// app/components/_sanjuan/SanJuanSection3Dynamic.tsx
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "~/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "~/components/ui/carousel";
import { motion, useInView } from "framer-motion";
import ImageGalleryModal from "../ui/ImageGalleryModal";

// Child Props type
type ImageType = {
  source: string | null;
  alt: string;
};

type ChildProps = {
  width: number;
  images?: ImageType[];
};

const SanJuanSection3Dynamic: React.FC<ChildProps> = ({ width, images = [] }) => {
  const plugin = React.useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));
  const ref = React.useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  // Hide removed images (null/empty source)
  const processedImages = React.useMemo(() => {
    return images
      .filter((img): img is { source: string; alt: string } => typeof img?.source === "string" && img.source.trim().length > 0)
      .map((img) => ({
        source: img.source,
        alt: img.alt || "Tour image",
      }));
  }, [images]);

  if (processedImages.length === 0) {
    return null;
  }

  const imageUrls = processedImages.map(img => img.source);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-10">
              {processedImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer aspect-[4/3]"
                  onClick={() => handleImageClick(index)}
                >
                  <img 
                    src={image.source}
                    alt={image.alt}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </motion.div>
              ))}
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
                  {processedImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-1 cursor-pointer h-full"
                        onClick={() => handleImageClick(index)}
                      >
                        <Card className="w-full aspect-square overflow-hidden shadow-lg hover:shadow-xl transition-all">
                          <CardContent className="w-full h-full p-0">
                            <img
                              src={image.source}
                              alt={image.alt}
                              className="w-full h-full object-cover"
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

export default SanJuanSection3Dynamic;
