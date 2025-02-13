// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { sanJuanSection5Type } from "~/data/data";

// Child Props type
type ChildProps = {
  width: number;
  SanJuanSection5Text: sanJuanSection5Type;
};

const SanJuanSection5: React.FC<ChildProps> = ({ width, SanJuanSection5Text }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-300px" });

  // Common text styles for h3 elements
  const commonH3Styles = `
    transition-all duration-500 ease-in-out 
    text-orange-950 font-sans text-center
    leading-normal
  `;

  const getResponsiveTextSize = (small: string, semismall: string, medium: string,  semilarge: string, large: string) => 
    `${width <= 350 ? small : width <= 450 ? semismall :  width <= 580 ? medium : width <= 768 ? semilarge : large}`;  

  return (
    <motion.div 
      ref={ref}
      animate={isInView ? 
        { opacity: 1, y: 0 } : 
        { opacity: 0, y: 50 }
      }
      transition={{ duration: 0.8 }}
      className="w-[95%] max-w-[1280px] mx-auto my-2 flex flex-col items-center justify-center relative z-0"
    >
      {/* Title Section */}
      <motion.div 
        animate={isInView ? 
          { opacity: 1, scale: 1 } : 
          { opacity: 0, scale: 0.95 }
        }
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`
          w-full flex ${width <= 500 ? "flex-col" : "flex-row"} 
          justify-center items-center -translate-y-[50px]
          gap-4
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
        <motion.h3 
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
          {SanJuanSection5Text.firstH3}
        </motion.h3>
      </motion.div>

      {/* Content Section */}
      <motion.div 
        animate={isInView ? 
          { opacity: 1, y: 0 } : 
          { opacity: 0, y: 30 }
        }
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full flex flex-row flex-wrap justify-center items-center p-6 gap-8 -translate-y-[40px]"
      >
        <motion.img 
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
          src="/plazareina2.jpg" 
          alt="Viajes en Barca en San Juan desde Valencia. BOAT TRIP AND EXCURSION FROM VALENCIA" 
          className="
            rounded-2xl max-h-[350px] object-cover 
            shadow-lg hover:shadow-xl transition-shadow duration-300
          "
        />
        
        <motion.div 
          animate={isInView ? 
            { opacity: 1, x: 0 } : 
            { opacity: 0, x: 30 }
          }
          transition={{ duration: 0.6, delay: 0.5 }}
          className={`
            flex flex-col gap-3 my-auto
            ${width <= 1280 ? "w-full" : "w-1/2"}
          `}
        >
          {[
            SanJuanSection5Text.secondH3,
            SanJuanSection5Text.thirdH3,
            SanJuanSection5Text.fourthH3,
            SanJuanSection5Text.fifthH3
          ].map((text, index) => (
            <motion.h3 
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
                hover:text-orange-900
              `}
            >
              {text}
            </motion.h3>
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
  );
};

export default SanJuanSection5;
