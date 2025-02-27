import { Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingButtonProps {
  text: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector('#hero-section');
      
      // If hero-section exists, show button after scrolling past it
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setIsVisible(heroBottom < 0);
      } else {
        // If no hero-section exists (on dynamic pages), show button after scrolling a bit
        setIsVisible(window.scrollY > 300);
      }
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Link to="/book" className="w-full flex justify-center">
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            className="fixed bottom-8 mx-auto z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-12 rounded-full shadow-xl transition-colors duration-300">
              {text}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
};

export default FloatingButton; 