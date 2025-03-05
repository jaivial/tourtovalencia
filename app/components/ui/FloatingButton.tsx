import { Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingButtonProps {
  text: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    // Handle scroll to determine when to show the button
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

  useEffect(() => {
    // Function to check if footer is visible
    const checkFooterVisibility = () => {
      const footerElement = document.querySelector('#site-footer');
      if (!footerElement) return;
      
      const footerRect = footerElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Footer is considered visible if any part of it is in the viewport
      // We add a 150px buffer so the button disappears before the footer is fully visible
      const isVisible = footerRect.top < windowHeight + 150;
      setIsFooterVisible(isVisible);
    };
    
    // Check immediately
    checkFooterVisibility();
    
    // Check on scroll
    window.addEventListener('scroll', checkFooterVisibility);
    window.addEventListener('resize', checkFooterVisibility);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', checkFooterVisibility);
      window.removeEventListener('resize', checkFooterVisibility);
    };
  }, []);

  // Button should be visible only when:
  // 1. We've scrolled past the hero section (isVisible is true)
  // 2. The footer is not visible
  const shouldShowButton = isVisible && !isFooterVisible;

  return (
    <Link to="/book" className="w-full flex justify-center">
      <AnimatePresence>
        {shouldShowButton && (
          <motion.div 
            className="fixed bottom-8 mx-auto z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-12 rounded-full shadow-xl transition-colors duration-300"
              aria-label="Book now"
            >
              {text}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
};

export default FloatingButton; 