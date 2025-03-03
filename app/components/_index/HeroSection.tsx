//UI Component: just responsible for displaying pure html with props passed from feature component
import { HeroSectionType } from "~/data/data";
import { motion } from "framer-motion";
import { ArrowDownCircle } from "lucide-react";

// Child Props type
type ChildProps = {
  width: number;
  height: number;
  heroSectionText: HeroSectionType;
};

const HeroSection: React.FC<ChildProps> = ({ width, height, heroSectionText }) => {
  return (
    <div className="w-full overflow-x-hidden min-h-[100dvh] flex flex-col justify-center items-center relative" id="hero-section">
      {/* Background image with responsive handling */}
      <div className="absolute inset-0 w-full h-full">
        <picture>
          {/* Mobile portrait */}
          <source
            media="(max-width: 570px)"
            srcSet="/valenciaadventure1-mobile.webp"
          />

          {/* Desktop default */}
          <img
            src="/valenciaadventure1.jpg"
            alt="Valencia Adventure Background"
            className="w-full h-full object-cover object-center brightness-[0.85]"
          />
        </picture>
      </div>

      {/* Darker overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/20" />

      {/* Content container */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-[92%] sm:w-[95%] max-w-[1280px] min-h-[100dvh] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-12 relative z-10 px-2 sm:px-4"
      >
        {/* Title group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8 mx-20"
        >
          <h2 className={`
            font-bold font-sans text-center tracking-wide
            bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent
            drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]
            ${width <= 290 ? "text-[1.8rem]" : 
              width <= 350 ? "text-[2rem]" : 
              width <= 400 ? "text-[2.25rem]" : 
              width <= 450 ? "text-[2.5rem]" : 
              width <= 500 ? "text-[2.8rem]" : 
              width <= 570 ? "text-[3rem]" : 
              width <= 640 ? "text-[3.5rem]" : 
              width <= 768 ? "text-[4rem]" : 
              width <= 1024 ? "text-[5rem]" : 
              "text-[6rem]"
            }
            leading-[1.1]
          `}>
            {heroSectionText.firstH2Orange}
          </h2>
          <h2 className={`
            font-bold font-sans bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent text-center
            tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]
               ${width <= 290 ? "text-[1.8rem]" : 
              width <= 350 ? "text-[2rem]" : 
              width <= 400 ? "text-[2.25rem]" : 
              width <= 450 ? "text-[2.5rem]" : 
              width <= 500 ? "text-[2.8rem]" : 
              width <= 570 ? "text-[3rem]" : 
              width <= 640 ? "text-[3.5rem]" : 
              width <= 768 ? "text-[4rem]" : 
              width <= 1024 ? "text-[5rem]" : 
              "text-[6rem]"
            }
            leading-[1.1]
          `}>
            {heroSectionText.firstH2}
          </h2>
        </motion.div>

        {/* Subtitle group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col gap-4 sm:gap-6 md:gap-8"
        >
          <h3 className={`
            font-bold font-sans text-white text-center
            drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]
            ${width <= 290 ? "text-[1rem]" : 
              width <= 350 ? "text-[1.2rem]" : 
              width <= 450 ? "text-[1.5rem]" : 
              width <= 640 ? "text-[1.8rem]" : 
              width <= 768 ? "text-[2.2rem]" : 
              width <= 1024 ? "text-[2.8rem]" : 
              "text-[3.2rem]"
            }
            leading-[1.2]
          `}>
            {heroSectionText.firstH3}
          </h3>
          <h3 className={`
            font-bold font-sans text-white text-center
            drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]
            ${width <= 290 ? "text-[1rem]" : 
              width <= 350 ? "text-[1.2rem]" : 
              width <= 450 ? "text-[1.5rem]" : 
              width <= 640 ? "text-[1.8rem]" : 
              width <= 768 ? "text-[2.2rem]" : 
              width <= 1024 ? "text-[2.8rem]" : 
              "text-[3.2rem]"
            }
            leading-[1.2]
          `}>
            {heroSectionText.secondH3}
          </h3>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.9,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 1
          }}
          className={`absolute ${width <= 350 ? "bottom-4" : width <= 640 ? "bottom-6" : "bottom-12"}`}
        >
          <ArrowDownCircle 
            className={`
              ${width <= 350 ? "w-6 h-6" : 
                width <= 640 ? "w-8 h-8" : 
                "w-12 h-12"
              } 
              text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]
            `}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
