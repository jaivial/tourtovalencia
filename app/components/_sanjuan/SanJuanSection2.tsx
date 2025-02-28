// app/components/_sanjuan/SanJuanSection2.tsx
/* eslint-disable react/prop-types */
//UI Component: just responsible for displaying pure html with props passed from feature component
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { sanJuansection2Type } from "~/data/data";
import { useSanJuanSection2 } from "./SanJuanSection2.hooks";
import { 
  Palmtree, 
  Sun, 
  Waves, 
  Umbrella, 
  Compass, 
  Anchor, 
  MapPin, 
  Mountain, 
  Cloud 
} from "lucide-react";

// Child Props type
type ChildProps = {
  width: number;
  height: number; // Keep in type definition for API compatibility
  SanJuanSection2Text: sanJuansection2Type;
};

// Prop validation is handled by TypeScript through the ChildProps type definition

const SanJuanSection2: React.FC<ChildProps> = ({ width, SanJuanSection2Text }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const { imageStyle } = useSanJuanSection2(SanJuanSection2Text);
  const isLottieEnabled = SanJuanSection2Text.lottieAnimation?.enabled ?? true;
  const lottieSource = SanJuanSection2Text.lottieAnimation?.src || "https://lottie.host/c75de82a-9932-4b71-b021-22934b5e5b17/QbeG97Ss7A.lottie";

  const commonH3Styles = `
    transition-all duration-500 ease-in-out 
    text-blue-950 font-sans text-center
    leading-normal hover:text-blue-900
  `;

  const getResponsiveTextSize = (small: string, medium: string, large: string) => 
    `${width <= 350 ? small : width <= 450 ? medium : large}`;

  // Function to render the appropriate animation based on the source
  const renderAnimation = () => {
    // Check if it's a Lottie animation or an icon
    if (lottieSource === "https://lottie.host/c75de82a-9932-4b71-b021-22934b5e5b17/QbeG97Ss7A.lottie") {
      return (
        <DotLottieReact 
          src={lottieSource} 
          loop 
          autoplay 
          className={`
            translate-y-[50px] mb-4
            ${width <= 450 ? "w-[300px]" : "w-[400px]"}
          `} 
        />
      );
    } else {
      // Render the appropriate icon based on the source identifier
      const iconSize = width <= 450 ? 100 : 150;
      const iconClassName = "text-blue-500 translate-y-[50px] mb-4";
      
      switch (lottieSource) {
        case "beach-icon":
          return <Palmtree size={iconSize} className={iconClassName} />;
        case "sun-icon":
          return <Sun size={iconSize} className={iconClassName} />;
        case "waves-icon":
          return <Waves size={iconSize} className={iconClassName} />;
        case "palm-icon":
          return <Palmtree size={iconSize} className={iconClassName} />;
        case "umbrella-icon":
          return <Umbrella size={iconSize} className={iconClassName} />;
        case "compass-icon":
          return <Compass size={iconSize} className={iconClassName} />;
        case "anchor-icon":
          return <Anchor size={iconSize} className={iconClassName} />;
        case "map-icon":
          return <MapPin size={iconSize} className={iconClassName} />;
        case "mountain-icon":
          return <Mountain size={iconSize} className={iconClassName} />;
        case "cloud-icon":
          return <Cloud size={iconSize} className={iconClassName} />;
        default:
          // If it's not a recognized icon identifier, try to render it as a Lottie animation
          return (
            <DotLottieReact 
              src={lottieSource} 
              loop 
              autoplay 
              className={`
                translate-y-[50px] mb-4
                ${width <= 450 ? "w-[300px]" : "w-[400px]"}
              `} 
            />
          );
      }
    }
  };

  return (
    <div 
      ref={ref}
      className="w-full overflow-x-hidden"
    >
      <motion.div 
        animate={isInView ? 
          { opacity: 1, y: 0 } : 
          { opacity: 0, y: 50 }
        }
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
          animate={isInView ? 
            { opacity: 1, x: 0 } : 
            { opacity: 0, x: -50 }
          }
          initial={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`
            w-full max-w-[620px] min-h-[300px] 
            flex flex-col justify-center items-center gap-6 
            ${width <= 1280 ? "p-4 -mt-16" : "p-6 -mt-28"} 
          `}
        >
          {isLottieEnabled && (
            <motion.div
              animate={isInView ? 
                { opacity: 1, scale: 1 } : 
                { opacity: 0, scale: 0.9 }
              }
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full flex justify-center"
            >
              {renderAnimation()}
            </motion.div>
          )}

          {[
            SanJuanSection2Text.firstH3,
            SanJuanSection2Text.secondH3,
            SanJuanSection2Text.thirdH3
          ].map((text, index) => (
            <motion.h3 
              key={index}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? 
                { opacity: 1, x: 0 } : 
                { opacity: 0, x: -20 }
              }
              transition={{ 
                duration: 0.5, 
                delay: 0.4 + (index * 0.1) 
              }}
              className={`
                ${commonH3Styles}
                font-medium
                ${getResponsiveTextSize(
                  "text-[1.3rem]",
                  "text-[1.4rem]",
                  "text-[1.8rem]"
                )}
                max-w-[90%]
                px-4
              `}
            >
              {text}
            </motion.h3>
          ))}
        </motion.div>

        {/* Right Image Section */}
        <motion.div 
          animate={isInView ? 
            { opacity: 1, x: 0 } : 
            { opacity: 0, x: 50 }
          }
          initial={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`
            w-full max-w-[720px] px-4 
            flex flex-col justify-center items-center relative 
            ${width <= 1280 ? "h-fit mt-8 mb-0" : "h-[600px]"}
          `}
        >
          <motion.img 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            src={imageStyle.src}
            alt="Cuevas de San Juan, visita guiada y viaje en barca." 
            className="
              w-full h-auto rounded-2xl mt-28
              shadow-lg hover:shadow-xl 
              transition-shadow duration-300 
              max-w-[100vw]
            " 
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SanJuanSection2;
