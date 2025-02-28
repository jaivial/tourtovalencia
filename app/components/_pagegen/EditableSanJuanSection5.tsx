/* eslint-disable react/prop-types */
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { sanJuanSection5Type } from "~/data/data";
import EditableText from "./EditableText";
import { useEditableSanJuanSection5 } from "./EditableSanJuanSection5.hooks";
import ImageUpload from "./ImageUpload";

// eslint-disable-next-line react/prop-types
interface EditableSanJuanSection5Props {
  width: number;
  data?: sanJuanSection5Type;
  onUpdate: (field: keyof sanJuanSection5Type, value: string) => void;
  onImageUpdate?: (file: File) => void | Promise<void>;
  onImageRemove?: () => void | Promise<void>;
}

const DEFAULT_SECTION5_DATA: sanJuanSection5Type = {
  firstH3: "¿Qué haremos en San Juan?",
  secondH3: "Nos bañaremos en las aguas cristalinas de la playa de San Juan",
  thirdH3: "Disfrutaremos de un día de playa y relax",
  fourthH3: "Podremos practicar snorkel y ver los peces",
  fifthH3: "Tendremos tiempo libre para explorar el pueblo",
  image: "/plazareina2.jpg" // Default fallback image
};

// eslint-disable-next-line react/prop-types
const EditableSanJuanSection5: React.FC<EditableSanJuanSection5Props> = ({ 
  width, 
  data = DEFAULT_SECTION5_DATA,
  onUpdate,
  onImageUpdate,
  onImageRemove
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const { sectionData, handleTextUpdate } = useEditableSanJuanSection5(data);

  // Debug logs
  console.log("EditableSanJuanSection5: data received:", data);
  console.log("EditableSanJuanSection5: sectionData:", sectionData);
  console.log("EditableSanJuanSection5: image URL:", sectionData.image || "/plazareina2.jpg");

  // Common text styles for h3 elements
  const commonH3Styles = `
    transition-all duration-500 ease-in-out 
    text-blue-950 font-sans text-center
    leading-normal
  `;

  const getResponsiveTextSize = (small: string, semismall: string, medium: string, semilarge: string, large: string) => 
    `${width <= 350 ? small : width <= 450 ? semismall : width <= 580 ? medium : width <= 768 ? semilarge : large}`;  

  const handleImageChange = async (file: File) => {
    if (onImageUpdate) {
      try {
        console.log("EditableSanJuanSection5: Processing image update:", file.name, file.type, file.size);
        
        // Create a local preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          console.log("EditableSanJuanSection5: Local preview created:", base64.substring(0, 30) + '...');
          
          // Update local state for immediate preview
          handleTextUpdate("image", base64);
        };
        reader.readAsDataURL(file);
        
        // Also call the parent handler for saving to database
        await onImageUpdate(file);
      } catch (error) {
        console.error("EditableSanJuanSection5: Error updating image:", error);
      }
    }
  };

  const handleImageRemove = async () => {
    if (onImageRemove) {
      try {
        console.log("EditableSanJuanSection5: Removing image");
        await onImageRemove();
      } catch (error) {
        console.error("EditableSanJuanSection5: Error removing image:", error);
      }
    } else {
      // If no remove handler is provided, just update the local state
      handleTextUpdate("image", "/plazareina2.jpg");
      onUpdate("image", "/plazareina2.jpg");
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? 
          { opacity: 1, y: 0 } : 
          { opacity: 0, y: 50 }
        }
        transition={{ duration: 0.8 }}
        className="w-[95%] max-w-[1280px] mx-auto my-2 flex flex-col items-center justify-center relative z-[1]"
      >
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? 
            { opacity: 1, scale: 1 } : 
            { opacity: 0, scale: 0.95 }
          }
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`
            w-full flex flex-col
            justify-center items-center -translate-y-[50px]
            gap-4 px-4
          `}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <DotLottieReact 
              src="https://lottie.host/e422824f-429d-4dcd-86ba-b35f3d467061/jgsDOnfLdH.lottie" 
              loop 
              autoplay 
              className="h-[170px] w-auto" 
            />
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            animate={isInView ? 
              { opacity: 1, x: 0 } : 
              { opacity: 0, x: 20 }
            }
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`
              ${commonH3Styles}
              font-bold leading-[1.6]
              ${width <= 1280 ? "" : "-translate-x-[50px]"}
              ${getResponsiveTextSize("text-[1.7rem]", "text-[2.1rem]", "text-[2.5rem]", "text-[2.9rem]", "text-[3.3rem]")}
            `}
          >
            <EditableText
              value={sectionData.firstH3}
              onUpdate={(value) => {
                handleTextUpdate("firstH3", value);
                onUpdate("firstH3", value);
              }}
              className={`${commonH3Styles} text-blue-950`}
            />
          </motion.div>
        </motion.div>

        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? 
            { opacity: 1, y: 0 } : 
            { opacity: 0, y: 30 }
          }
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full flex flex-col justify-center items-center p-6 gap-8 -translate-y-[40px]"
        >
          <motion.div 
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className="
              rounded-2xl overflow-hidden
              shadow-lg hover:shadow-xl transition-shadow duration-300
              w-full max-w-[750px] h-[500px]
            "
          >
            <ImageUpload
              imageUrl={sectionData.image || "/plazareina2.jpg"}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
              className="w-full h-full"
            />
          </motion.div>
          
          <motion.div 
            animate={isInView ? 
              { opacity: 1, x: 0 } : 
              { opacity: 0, x: 30 }
            }
            transition={{ duration: 0.6, delay: 0.5 }}
            className={`
              flex flex-col gap-3 my-auto
              ${width <= 768 ? "w-full" : "w-1/2"}
            `}
          >
            {[
              { key: "secondH3", value: sectionData.secondH3 },
              { key: "thirdH3", value: sectionData.thirdH3 },
              { key: "fourthH3", value: sectionData.fourthH3 },
              { key: "fifthH3", value: sectionData.fifthH3 }
            ].map(({ key, value }, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.02, x: 10 }}
                animate={isInView ? 
                  { opacity: 1, x: 0 } : 
                  { opacity: 0, x: 20 }
                }
                transition={{ 
                  duration: 0.5, 
                  delay: 0.6 + (index * 0.1) 
                }}
                className={`
                  ${commonH3Styles}
                  font-medium
                  ${getResponsiveTextSize("text-[1rem]", "text-[1.2rem]", "text-[1.4rem]", "text-[1.6rem]", "text-[1.8rem]")}
                `}
              >
                <EditableText
                  value={value}
                  onUpdate={(newValue) => {
                    handleTextUpdate(key as keyof sanJuanSection5Type, newValue);
                    onUpdate(key as keyof sanJuanSection5Type, newValue);
                  }}
                  className={`${commonH3Styles} text-blue-950`}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          animate={isInView ? 
            { opacity: 1, scale: 1 } : 
            { opacity: 0, scale: 0.9 }
          }
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <DotLottieReact 
            src="https://lottie.host/88bf0f6a-04a0-48ea-a36c-f5e082079f9f/gymc6ImWs9.lottie" 
            loop 
            autoplay 
            className="w-[90%] max-w-[500px] -translate-y-[40px]" 
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EditableSanJuanSection5;
