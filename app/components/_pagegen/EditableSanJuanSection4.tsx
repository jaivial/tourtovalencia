import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { sanJuansection4Type } from "~/data/data";
import EditableText from "./EditableText";
import { useEditableSanJuanSection4 } from "./EditableSanJuanSection4.hooks";

interface EditableSanJuanSection4Props {
  width: number;
  data: sanJuansection4Type;
  onUpdate: (field: keyof sanJuansection4Type, value: string) => void;
}

const EditableSanJuanSection4: React.FC<EditableSanJuanSection4Props> = ({ 
  width,
  data,
  onUpdate 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const { sectionData, handleTextUpdate } = useEditableSanJuanSection4(data);

  const commonH3Styles = `
    transition-all duration-500 ease-in-out 
    text-blue-950 font-sans text-center
    leading-normal hover:text-blue-900
  `;

  const getResponsiveTextSize = (small: string, semismall: string, medium: string, semilarge: string, large: string) => 
    `${width <= 350 ? small : width <= 450 ? semismall : width <= 580 ? medium : width <= 768 ? semilarge : large}`;

  return (
    <motion.div 
      ref={ref}
      animate={isInView ? 
        { opacity: 1, y: 0 } : 
        { opacity: 0, y: 50 }
      }
      transition={{ duration: 0.8 }}
      className={`
        w-[95%] max-w-[1280px] flex flex-col flex-wrap-reverse 
        items-center justify-center mt-4 mb-16 mx-auto relative z-0 
        ${width <= 1280 ? "gap-0" : "gap-10"}
      `}
    >
      <motion.div 
        animate={isInView ? 
          { opacity: 1, scale: 1 } : 
          { opacity: 0, scale: 0.9 }
        }
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`
          w-full max-w-[620px] min-h-[600px] 
          flex flex-col justify-center items-center 
          p-6 gap-8 -translate-y-[50px]
        `}
      >
        <DotLottieReact 
          src="https://lottie.host/f8570958-3acf-4c42-8ae6-2ad50fe220c7/N8q8bzQLK3.lottie" 
          loop 
          autoplay 
          className={`${width <= 500 ? "w-[400px]" : "w-[600px]"}`} 
        />

        <motion.div 
          whileHover={{ scale: 1.02 }}
          animate={isInView ? 
            { opacity: 1, x: 0 } : 
            { opacity: 0, x: -20 }
          }
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`
            ${commonH3Styles}
            font-bold leading-[1.6]
            ${getResponsiveTextSize(
              "text-[1.7rem]", 
              "text-[2.1rem]", 
              "text-[2.5rem]", 
              "text-[2.9rem]", 
              "text-[3.3rem]"
            )}
          `}
        >
          <EditableText
            value={sectionData.firstH3}
            onUpdate={(value) => {
              handleTextUpdate("firstH3", value);
              onUpdate("firstH3", value);
            }}
            className="w-full text-blue-950"
          />
          <br />
          <span className="font-medium">
            <EditableText
              value={sectionData.secondH3}
              onUpdate={(value) => {
                handleTextUpdate("secondH3", value);
                onUpdate("secondH3", value);
              }}
              className="w-full text-blue-950"
            />
          </span>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          animate={isInView ? 
            { opacity: 1, x: 0 } : 
            { opacity: 0, x: 20 }
          }
          transition={{ duration: 0.6, delay: 0.6 }}
          className={`
            ${commonH3Styles}
            font-medium
            ${getResponsiveTextSize(
              "text-[1.1rem]", 
              "text-[1.4rem]",
              "text-[1.7rem]",
              "text-[2rem]",
              "text-[2.3rem]"
            )}
          `}
        >
          <EditableText
            value={sectionData.thirdH3}
            onUpdate={(value) => {
              handleTextUpdate("thirdH3", value);
              onUpdate("thirdH3", value);
            }}
            className="w-full text-blue-950"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EditableSanJuanSection4;
