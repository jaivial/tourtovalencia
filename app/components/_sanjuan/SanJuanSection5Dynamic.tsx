/* eslint-disable react/prop-types */
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import type { sanJuanSection5Type } from "~/data/data";
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

interface SanJuanSection5DynamicProps {
  width: number;
  SanJuanSection5Text: sanJuanSection5Type;
}

const SanJuanSection5Dynamic: React.FC<SanJuanSection5DynamicProps> = ({ 
  width, 
  SanJuanSection5Text 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const isLottieEnabled = SanJuanSection5Text.lottieAnimation?.enabled ?? true;
  const lottieSource = SanJuanSection5Text.lottieAnimation?.src || "https://lottie.host/e422824f-429d-4dcd-86ba-b35f3d467061/jgsDOnfLdH.lottie";

  // Debug logging
  useEffect(() => {
    console.log("SanJuanSection5Dynamic: Animation source:", lottieSource);
    console.log("SanJuanSection5Dynamic: Animation enabled:", isLottieEnabled);
    console.log("SanJuanSection5Dynamic: Is GIF?", lottieSource.includes("giphy.gif") || lottieSource.includes("giphy.com"));
    console.log("SanJuanSection5Dynamic: Is Lottie?", lottieSource.endsWith(".lottie"));
  }, [lottieSource, isLottieEnabled]);

  // Common text styles for h3 elements
  const commonH3Styles = `
    transition-all duration-500 ease-in-out 
    text-blue-950 font-sans text-center
    leading-normal
  `;

  const getResponsiveTextSize = (small: string, semismall: string, medium: string, semilarge: string, large: string) => 
    `${width <= 350 ? small : width <= 450 ? semismall : width <= 580 ? medium : width <= 768 ? semilarge : large}`;  

  // Use the image from the database or fallback to the default
  const imageUrl = SanJuanSection5Text.image || "/plazareina2.jpg";

  // Function to render the appropriate animation based on the source
  const renderAnimation = () => {
    // Check if it's a GIF animation
    if (lottieSource.includes("giphy.gif") || lottieSource.includes("giphy.com")) {
      console.log("SanJuanSection5Dynamic: Rendering GIF animation");
      return (
        <img 
          src={lottieSource} 
          alt="Animation" 
          className="h-[170px] w-auto object-contain" 
        />
      );
    }
    // Check if it's a Lottie animation or an icon
    else if (lottieSource.endsWith(".lottie")) {
      console.log("SanJuanSection5Dynamic: Rendering Lottie animation");
      return (
        <DotLottieReact 
          src={lottieSource} 
          loop 
          autoplay 
          className="h-[170px] w-auto" 
        />
      );
    } else {
      // Render the appropriate icon based on the source identifier
      console.log("SanJuanSection5Dynamic: Rendering icon or default animation");
      const iconSize = 100;
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
              className="h-[170px] w-auto" 
            />
          );
      }
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
            {isLottieEnabled && renderAnimation()}
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
            {SanJuanSection5Text.firstH3}
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
          className="w-full flex flex-row flex-wrap justify-center items-center p-6 gap-8 -translate-y-[40px]"
        >
          <motion.img 
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            src={imageUrl}
            alt="Tour experience image" 
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
                {text}
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

export default SanJuanSection5Dynamic; 