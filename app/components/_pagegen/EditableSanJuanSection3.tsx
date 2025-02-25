import * as React from "react";
import { motion, useInView } from "framer-motion";
import ImageGalleryModal from "../ui/ImageGalleryModal";
import ImageUpload from "./ImageUpload";
import { sanJuanSection3Type } from "~/data/data";

type EditableSanJuanSection3Props = {
  width: number;
  data: sanJuanSection3Type;
  onUpdate: (index: number, file: string) => void;
  onRemove: (index: number) => void;
};

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const EditableSanJuanSection3: React.FC<EditableSanJuanSection3Props> = ({ 
  width, 
  data,
  onUpdate,
  onRemove
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setModalOpen(true);
  };

  const handleImageUpdate = async (index: number, file: File) => {
    const base64 = await convertToBase64(file);
    onUpdate(index, base64 as any); // Using any here since we're changing the type
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
              {/* Large image spanning 2 rows */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl"
              >
                <ImageUpload
                  imageUrl={data.images[0]?.source || ""}
                  onImageChange={(file) => handleImageUpdate(0, file)}
                  onImageRemove={() => onRemove(0)}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>

              {/* Top right image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="col-span-2 relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl"
              >
                <ImageUpload
                  imageUrl={data.images[1]?.source || ""}
                  onImageChange={(file) => handleImageUpdate(1, file)}
                  onImageRemove={() => onRemove(1)}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>

              {/* Bottom right images */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl"
              >
                <ImageUpload
                  imageUrl={data.images[2]?.source || ""}
                  onImageChange={(file) => handleImageUpdate(2, file)}
                  onImageRemove={() => onRemove(2)}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl"
              >
                <ImageUpload
                  imageUrl={data.images[3]?.source || ""}
                  onImageChange={(file) => handleImageUpdate(3, file)}
                  onImageRemove={() => onRemove(3)}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>

              {/* Bottom row images */}
              {[4, 5, 6, 7].map((index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl"
                >
                  <ImageUpload
                    imageUrl={data.images[index]?.source || ""}
                    onImageChange={(file) => handleImageUpdate(index, file)}
                    onImageRemove={() => onRemove(index)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="w-full py-10">
              <div className="grid grid-cols-2 gap-4">
                {data.images.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl"
                  >
                    <ImageUpload
                      imageUrl={data.images[index]?.source || ""}
                      onImageChange={(file) => handleImageUpdate(index, file)}
                      onImageRemove={() => onRemove(index)}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <ImageGalleryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={data.images.map(img => img.source)}
        initialIndex={selectedImageIndex}
      />
    </>
  );
};

export default EditableSanJuanSection3;
