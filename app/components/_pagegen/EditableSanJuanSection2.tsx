import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { sanJuansection2Type } from "~/data/data";
import EditableText from "./EditableText";

// Child Props type
type ChildProps = {
  width: number;
  height: number;
  SanJuanSection2Text: sanJuansection2Type;
  onTextUpdate: (key: keyof sanJuansection2Type, value: string) => void;
};

const EditableSanJuanSection2: React.FC<ChildProps> = ({ width, height, SanJuanSection2Text, onTextUpdate }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });

  const commonH3Styles = `
    transition-all duration-500 ease-in-out 
    text-blue-950 font-sans text-center
    leading-normal hover:text-blue-900
  `;

  const getResponsiveTextSize = (small: string, medium: string, large: string) => `${width <= 350 ? small : width <= 450 ? medium : large}`;

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
            ${width <= 1280 ? "p-4 -mt-16" : "p-6 -mt-28"} 
          `}
        >
          <motion.div animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }} initial={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5, delay: 0.3 }} className="w-full flex justify-center">
            <DotLottieReact
              src="https://lottie.host/c75de82a-9932-4b71-b021-22934b5e5b17/QbeG97Ss7A.lottie"
              loop
              autoplay
              className={`
                translate-y-[50px] mb-4
                ${width <= 450 ? "w-[300px]" : "w-[400px]"}
              `}
            />
          </motion.div>

          {[
            { text: SanJuanSection2Text.firstH3, key: "firstH3" },
            { text: SanJuanSection2Text.secondH3, key: "secondH3" },
            { text: SanJuanSection2Text.thirdH3, key: "thirdH3" },
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
              <EditableText text={text} onUpdate={(newText) => onTextUpdate(key as keyof sanJuansection2Type, newText)} className={commonH3Styles} placeholder={`Editable Text ${index + 1}`} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EditableSanJuanSection2;
