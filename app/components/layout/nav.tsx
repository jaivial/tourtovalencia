// app/components/layout/nav.tsx
import { useState, useEffect } from "react";
import { Menu, ArrowRightToLine, ChevronDown, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useFetcher, Link, useLocation, useLoaderData } from "@remix-run/react";
import type { RootLoaderData } from "~/root";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface NavProps {
  pages: unknown; // Keep the prop for compatibility but mark it as unused
}

const Nav: React.FC<NavProps> = () => {
  const { state, dispatch } = useLanguageContext();
  const { tours } = useLoaderData<RootLoaderData>();
  const fetcher = useFetcher();
  const navLinks = state.links;
  const currentLanguage = state.currentLanguage;
  const flag = state.flag;
  const location = useLocation();
  const [clientWidth, setClientWidth] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [isToursOpen, setIsToursOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Get active tours
  const activeTours = tours.filter(tour => tour.status === 'active');
  
  // Calculate dropdown height based on number of tours
  const dropdownItemHeight = 40; // Height of each dropdown item in pixels
  const baseDropdownPadding = 16; // Padding for the dropdown
  const dynamicDropdownHeight = activeTours.length * dropdownItemHeight + baseDropdownPadding;

  useEffect(() => {
    setIsMounted(true);
    const updateSize = () => {
      setClientWidth(window.innerWidth);
      setClientHeight(window.innerHeight);
    };
    
    const handleScroll = () => {
      const position = window.scrollY;
      setIsScrolled(position > 50);
    };
    
    updateSize();
    handleScroll(); // Initial check
    
    window.addEventListener("resize", updateSize);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Don't show nav on admin dashboard routes
  if (location.pathname.includes("/admin/dashboard")) {
    return null;
  }

  // Only render content after component is mounted on client
  if (!isMounted) {
    return null;
  }

  const handleChange = (selectedLanguage: string) => {
    dispatch({ type: "changeLanguage", payload: selectedLanguage });
    fetcher.submit({ language: selectedLanguage }, { method: "post", action: "/set-language" });
  };

  const handleLinkClick = () => {
    setMobileNavOpen(false);
  };

  // Animation variants for the navigation bar
  const navVariants: Variants = {
    initial: {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      y: 20,
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)"
    },
    scrolled: {
      backgroundColor: "rgba(30, 58, 138, 0.75)", // Reduced opacity from 0.9 to 0.75
      borderColor: "rgba(59, 130, 246, 0.3)", // Reduced opacity for border
      y: 16,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
    }
  };

  return (
    <>
      {clientWidth >= 1280 ? (
        <motion.div 
          className={`w-[95%] max-w-[920px] flex flex-row justify-between items-center h-[100px] backdrop-blur-xl mx-auto p-4 z-[90] rounded-2xl border ${isScrolled ? "fixed" : "absolute"}`}
          style={{ left: 0, right: 0 }}
          initial="initial"
          animate={isScrolled ? "scrolled" : "initial"}
          variants={navVariants}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 20,
            mass: 1
          }}
        >
          <div className="w-[45px]" />
          <img src="/logonuevoolga3.png" alt="Olga Travel" className={` ${clientWidth < 380 ? "h-[20px]" : "h-[100px]"} py-3 absolute left-1/2 -translate-x-1/2 w-auto`} />
          <Menu className="text-white cursor-pointer hover:text-blue-200 transition-colors" size={45} onClick={() => setMobileNavOpen(true)} />
        </motion.div>
      ) : (
        <motion.div 
          className={`w-[90%] max-w-[920px] flex flex-row justify-between items-center h-[100px] backdrop-blur-xl p-6 z-[90] rounded-2xl border ${isScrolled ? "fixed" : "absolute"}`}
          style={{ left: "50%", transform: "translateX(-50%)" }}
          initial="initial"
          animate={isScrolled ? "scrolled" : "initial"}
          variants={navVariants}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 20,
            mass: 1
          }}
        >
          <img src="/logonuevoolga3.png" alt="Olga Travel" className={` ${clientWidth < 380 ? "h-[50px]" : clientWidth < 450 ? "h-[60px]" : clientWidth < 500 ? "h-[70px]" : "h-[80px]"}`} />
          <Menu className="text-white cursor-pointer hover:text-blue-200 transition-colors z-[990]" size={45} onClick={() => setMobileNavOpen(true)} />
        </motion.div>
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div 
            className="fixed inset-0 z-[999] isolate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} onKeyDown={(e) => e.key === "Escape" && setMobileNavOpen(false)} role="button" tabIndex={0} />
            <motion.div 
              className="fixed right-0 top-0 h-dvh w-[400px] bg-blue-800/80 p-16 flex flex-col items-start justify-between gap-10"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
            >
              <img src="/logonuevoolga3.png" alt="Olga Travel" className="h-[80px]" />
              <div className={`h-full flex flex-col justify-start items-start w-full ${clientHeight <= 570 ? "justify-between" : "justify-start gap-14"}`}>
                <Select onValueChange={handleChange}>
                  <SelectTrigger className="w-[180px] bg-blue-50 flex flex-row justify-evenly">
                    <p className="text-2xl">{flag}</p>
                    <SelectValue placeholder={currentLanguage} />
                  </SelectTrigger>
                  <SelectContent style={{ zIndex: 1000 }}>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>

                {/* Regular Nav Links */}
                <div className="flex flex-col gap-6 w-full">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Link to={link.path} onClick={handleLinkClick} className="text-white text-2xl hover:text-blue-200 transition-colors">
                        {link.linkText}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Tours Dropdown - Moved below regular links */}
                  {activeTours.length > 0 && (
                    <div className="w-full">
                      <button onClick={() => setIsToursOpen(!isToursOpen)} className="w-full flex items-center justify-between text-blue-50 font-sans font-semibold text-xl group">
                        Tours
                        <ChevronDown className={`transition-transform duration-300 ${isToursOpen ? "rotate-180" : ""}`} size={20} />
                      </button>
                      <motion.div 
                        className="overflow-hidden"
                        initial={{ height: 0 }}
                        animate={{ 
                          height: isToursOpen ? dynamicDropdownHeight : 0,
                          marginTop: isToursOpen ? 16 : 0
                        }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 30 
                        }}
                      >
                        {/* Display tour links with localized names */}
                        {activeTours.map((tour, idx) => (
                          <motion.div
                            key={tour.slug}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: isToursOpen ? 1 : 0, x: isToursOpen ? 0 : 20 }}
                            transition={{ delay: 0.05 * idx, duration: 0.2 }}
                          >
                            <Link
                              to={`/pages/${tour.slug}`}
                              onClick={handleLinkClick}
                              className="pl-4 text-blue-50 hover:text-blue-200 transition-colors font-sans text-lg block py-2"
                            >
                              {currentLanguage === "English" ? tour.tourName.en : tour.tourName.es}
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full flex justify-between items-center">
                <ArrowRightToLine className="text-blue-950 bg-blue-50 rounded-3xl py-4 px-0 cursor-pointer hover:bg-blue-100 transition-colors" size={80} onClick={() => setMobileNavOpen(false)} />
                <Link to="/admin" onClick={handleLinkClick} className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors">
                  <Settings size={20} className="text-blue-100" />
                  <span className="text-blue-100 text-lg font-medium">Admin</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
