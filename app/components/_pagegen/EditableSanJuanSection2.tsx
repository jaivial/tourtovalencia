import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { sanJuansection2Type } from "~/data/data";
import EditableText from "./EditableText";
import ImageUpload from "./ImageUpload";
import { useEditableSanJuanSection2 } from "./EditableSanJuanSection2.hooks";

interface EditableSanJuanSection2Props {
  width: number;
  height: number;
  data: sanJuansection2Type;
  onUpdate: (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string }) => void;
}

const EditableSanJuanSection2: React.FC<EditableSanJuanSection2Props> = ({ 
  width, 
  height, 
  data, 
  onUpdate 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const { handleTextUpdate, handleImageChange, handleImageRemove } = useEditableSanJuanSection2(data);

  const commonH3Styles = `
    transition-all duration-500 ease-in-out 
    text-blue-950 font-sans text-center
    leading-normal hover:text-blue-900
  `;

  const getResponsiveTextSize = (small: string, medium: string, large: string) => 
    `${width <= 350 ? small : width <= 450 ? medium : large}`;

  return (
    <div ref={ref} className="w-full overflow-x-hidden">
      <motion.div
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        initial={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className={`
          w-[95%] max-w-[1280px] flex flex-row flex-wrap-reverse 
          items-center justify-center -mt-24 mb-16 mx-auto 
          relative z-[1] ${width <= 1280 ? "gap-0" : "gap-10"}
        `}
      >
        {/* Left Content Section */}
        <motion.div
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          initial={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`
            w-full max-w-[620px] min-h-[300px] 
            flex flex-col justify-center items-center gap-6 
            ${width <= 1280 ? "p-4 mt-16" : "p-6 mt-28"} 
          `}
        >
          <motion.div 
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }} 
            initial={{ opacity: 0, scale: 0.9 }} 
            transition={{ duration: 0.5, delay: 0.3 }} 
            className="w-full flex justify-center"
          >
            <div className="w-[400px] h-[300px] relative rounded-lg overflow-hidden">
              <ImageUpload 
                imageUrl={data.sectionImage?.preview || ""} 
                onImageChange={(file) => {
                  handleImageChange(file);
                  const preview = URL.createObjectURL(file);
                  onUpdate('sectionImage', { file, preview });
                }}
                onImageRemove={() => {
                  handleImageRemove();
                  onUpdate("sectionImage", { preview: "" });
                }} 
                className="w-full h-full object-cover" 
              />
            </div>
          </motion.div>

          {[
            { text: data.firstH3, key: "firstH3" },
            { text: data.secondH3, key: "secondH3" },
            { text: data.thirdH3, key: "thirdH3" },
          ].map(({ text, key }, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{
                duration: 0.5,
                delay: 0.4 + index * 0.1,
              }}
              className={`
                ${commonH3Styles}
                font-medium w-full
                ${getResponsiveTextSize("text-[1.3rem]", "text-[1.4rem]", "text-[1.5rem]")}
              `}
            >
              <EditableText 
                value={text} 
                onUpdate={(newText) => {
                  handleTextUpdate(key as keyof sanJuansection2Type, newText);
                  onUpdate(key as keyof sanJuansection2Type, newText);
                }} 
                className={commonH3Styles} 
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EditableSanJuanSection2;
