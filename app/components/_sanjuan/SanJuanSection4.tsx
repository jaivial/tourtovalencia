// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { sanJuansection4Type } from "~/data/data";
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
  SanJuanSection4Text: sanJuansection4Type;
};

const SanJuanSection4: React.FC<ChildProps> = ({ width, SanJuanSection4Text }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const isLottieEnabled = SanJuanSection4Text.lottieAnimation?.enabled ?? true;
  const lottieSource = SanJuanSection4Text.lottieAnimation?.src || "https://lottie.host/f8570958-3acf-4c42-8ae6-2ad50fe220c7/N8q8bzQLK3.lottie";

  const commonH3Styles = `
    transition-all duration-500 ease-in-out 
    text-blue-950 font-sans text-center
    leading-normal
  `;

  const getResponsiveTextSize = (small: string, semismall: string, medium: string, semilarge: string, large: string) => 
    `${width <= 350 ? small : width <= 450 ? semismall : width <= 580 ? medium : width <= 768 ? semilarge : large}`;

  // Function to render the appropriate animation based on the source
  const renderAnimation = () => {
    // Check if it's a GIF animation
    if (lottieSource.includes("giphy.gif")) {
      return (
        <img 
          src={lottieSource} 
          alt="Animation" 
          className={`
            ${width <= 500 ? "w-[300px]" : "w-[400px]"}
            object-contain
          `} 
        />
      );
    }
    // Check if it's a Lottie animation or an icon
    else if (lottieSource === "https://lottie.host/f8570958-3acf-4c42-8ae6-2ad50fe220c7/N8q8bzQLK3.lottie") {
      return (
        <DotLottieReact 
          src={lottieSource} 
          loop 
          autoplay 
          className={`${width <= 500 ? "w-[400px]" : "w-[600px]"}`} 
        />
      );
    } else {
      // Render the appropriate icon based on the source identifier
      const iconSize = width <= 450 ? 100 : 150;
      const iconClassName = "text-blue-500";
      
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
              className={`${width <= 500 ? "w-[400px]" : "w-[600px]"}`} 
            />
          );
      }
    }
  };

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
        {isLottieEnabled && renderAnimation()}

        <motion.h3 
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
          {SanJuanSection4Text.firstH3} 
          <br /> 
          <span className={`
            font-medium 
            ${width < 450 ? "text-[1.2rem]" : "text-[1.5rem]"}
          `}>
            {SanJuanSection4Text.secondH3}
          </span>
        </motion.h3>

        <motion.h3 
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
              "text-[1.6rem]", 
              "text-[1.8rem]", 
              "text-[2rem]"
            )}
          `}
        >
          {SanJuanSection4Text.thirdH3}
        </motion.h3>
      </motion.div>
    </motion.div>
  );
};

export default SanJuanSection4;
