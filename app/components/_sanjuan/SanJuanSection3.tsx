// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import * as React from "react";
import { carouselData, CarouselDataType } from "~/data/carouseldata";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "~/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "~/components/ui/carousel";
import { motion, useInView } from "framer-motion";
import ImageGalleryModal from "../ui/ImageGalleryModal";

// Child Props type
type ChildProps = {
  width: number;
};

const SanJuanSection3: React.FC<ChildProps> = ({ width }) => {
  const plugin = React.useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));
  const carouselImages: CarouselDataType[] = carouselData;
  const ref = React.useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6 }
    }
  };

  const imageUrls = [
    '/photo1IS3.webp',
    '/photo2IS3.webp',
    '/photo3IS3.webp',
    '/photo4IS3.webp'
  ];

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setModalOpen(true);
  };

  return (
    <>
      <div className="w-full overflow-x-hidden">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="w-[95%] max-w-[1280px] mx-auto relative z-[1] px-4"
        >
          {width > 580 ? (
            <div className="flex flex-col items-center justify-center my-10 gap-6">
              <motion.div 
                variants={imageVariants}
                initial="hidden"
                className="flex flex-row justify-center gap-6 items-center w-full"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="
                    rounded-2xl h-[400px] w-2/5 
                    bg-[url('/photo1IS3.webp')] bg-no-repeat bg-center bg-cover
                    shadow-lg hover:shadow-xl transition-all
                    transform perspective-1000 cursor-pointer"
                  onClick={() => handleImageClick(0)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="
                    rounded-2xl h-[400px] w-3/5 
                    bg-[url('/photo2IS3.webp')] bg-center bg-cover
                    shadow-lg hover:shadow-xl transition-all
                    transform perspective-1000 cursor-pointer"
                  onClick={() => handleImageClick(1)}
                />
              </motion.div>

              <motion.div 
                variants={imageVariants}
                initial="hidden"
                className="flex flex-row-reverse justify-center gap-6 items-center w-full"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="
                    rounded-2xl h-[400px] w-2/5 
                    bg-[url('/photo3IS3.webp')] bg-no-repeat bg-center bg-cover
                    shadow-lg hover:shadow-xl transition-all
                    transform perspective-1000 cursor-pointer"
                  onClick={() => handleImageClick(2)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="
                    rounded-2xl h-[400px] w-3/5 
                    bg-[url('/photo4IS3.webp')] bg-center bg-cover
                    shadow-lg hover:shadow-xl transition-all
                    transform perspective-1000 cursor-pointer"
                  onClick={() => handleImageClick(3)}
                />
              </motion.div>
            </div>
          ) : (
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6 }
                }
              }}
              initial="hidden"
              className="
                flex flex-col items-center justify-center 
                mb-0 mt-28 -translate-y-[100px] 
                rounded-2xl
              "
            >
              <Carousel 
                plugins={[plugin.current]} 
                className="w-full"
                onMouseEnter={plugin.current.stop} 
                onMouseLeave={plugin.current.reset}
              >
                <CarouselContent>
                  {carouselImages.map((image, index) => (
                    <CarouselItem key={image.index}>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-1 cursor-pointer"
                        onClick={() => handleImageClick(index)}
                      >
                        <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-all">
                          <CardContent 
                            className={`
                              flex aspect-square items-center justify-center 
                              rounded-xl p-6 bg-cover bg-center bg-no-repeat 
                              bg-[url('${image.source}')]
                              transform perspective-1000
                            `}
                          />
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
