//UI Component: just responsible for displaying pure html with props passed from feature component
import { HeroSectionType } from "~/data/data";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ArrowDownCircle } from "lucide-react";

// Child Props type
type ChildProps = {
  width: number;
  height: number;
  heroSectionText: HeroSectionType;
};

const HeroSection: React.FC<ChildProps> = ({ width, height, heroSectionText }) => {
  return (
    <div className="w-full bg-[url('/valenciaadventure1.jpg')] min-h-screen flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat bg-fixed relative">
      {/* Darker overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/0" />

      {/* Content container */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-[90%] max-w-[1280px] min-h-screen flex flex-col justify-center items-center gap-12 relative z-10"
      >
        {/* Title group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col gap-8 mb-8"
        >
          <h2 className={`
            font-bold font-sans text-center tracking-wide
            bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent h-[100%] p-4
            drop-shadow-[0_1.5px_10px_rgba(0,0,0,0.7)]
            ${width <= 350 ? "text-[3.2rem]" : 
              width <= 450 ? "text-[3.7rem]" : 
              width <= 768 ? "text-[4rem]" : 
              width <= 1024 ? "text-[5.2rem]" : 
              width <= 1280 ? "text-[6.2rem]" : 
              "text-[6.2rem]"
            }
          `}>
            {heroSectionText.firstH2Orange}
          </h2>
          <h2 className={`
            font-bold font-sans text-white text-center
            tracking-wide    drop-shadow-[0_1.5px_10px_rgba(0,0,0,0.7)]
            ${width <= 350 ? "text-[3.2rem]" : 
              width <= 450 ? "text-[3.7rem]" : 
              width <= 768 ? "text-[4rem]" : 
              width <= 1024 ? "text-[5.2rem]" : 
              width <= 1280 ? "text-[6.2rem]" : 
              "text-[5.2rem]"
            }
          `}>
            {heroSectionText.firstH2}
          </h2>
        </motion.div>

        {/* Subtitle group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col gap-8"
        >
          <h3 className={`
            font-bold font-sans text-white text-center
   drop-shadow-[0_1.5px_10px_rgba(0,0,0,0.7)]
            ${width <= 350 ? "text-[1.6rem]" : 
              width <= 450 ? "text-[2.2rem]" : 
              width <= 768 ? "text-[2.5rem]" : 
              width <= 1024 ? "text-[3.2rem]" : 
              width <= 1280 ? "text-[3.2rem]" : 
              "text-[4.2rem]"
            }
          `}>
            {heroSectionText.firstH3}
          </h3>
          <h3 className={`
            font-bold font-sans text-white text-center
   drop-shadow-[0_1.5px_10px_rgba(0,0,0,0.7)]
            ${width <= 350 ? "text-[1.6rem]" : 
              width <= 450 ? "text-[2.2rem]" : 
              width <= 768 ? "text-[2.5rem]" : 
              width <= 1024 ? "text-[3.2rem]" : 
              width <= 1280 ? "text-[3.2rem]" : 
              "text-[4.2rem]"
            }
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
          className="absolute bottom-12"
        >
          <ArrowDownCircle className="w-12 h-12 text-white drop-shadow-[0_1.5px_10px_rgba(0,0,0,0.7)]" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
