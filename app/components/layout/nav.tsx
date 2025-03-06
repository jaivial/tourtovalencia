// app/components/layout/nav.tsx
import { useState, useEffect } from "react";
import { Menu, ArrowRightToLine, ChevronDown, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useFetcher, useLocation, useLoaderData, useNavigate } from "@remix-run/react";
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
  const location = useLocation();
  const navigate = useNavigate();
  const [clientWidth, setClientWidth] = useState(0);
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

  const handleLinkClick = (path: string) => {
    setMobileNavOpen(false);
    
    // If we're navigating from a book route to a non-book route
    if (location.pathname.startsWith('/book') && !path.startsWith('/book')) {
      // Use window.location for a full page reload
      setTimeout(() => {
        window.location.href = path;
      }, 10);
    } else {
      // Use navigate for client-side navigation
      setTimeout(() => {
        navigate(path);
      }, 10);
    }
  };

  // Animation variants for the navigation bar
  const navVariants: Variants = {
    initial: {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)"
    },
    scrolled: {
      backgroundColor: "rgba(30, 58, 138, 0.75)", // Reduced opacity from 0.9 to 0.75
      borderColor: "rgba(59, 130, 246, 0.3)", // Reduced opacity for border
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
    }
  };

  // Language selector component to be reused
  const LanguageSelector = () => {
    // Use emoji flags instead of relying on the empty flag property
    const getFlag = (language: string) => {
      return language.toLowerCase() === 'en' ? '🇬🇧' : '🇪🇸';
    };
    
    // Determine the current language code (en or es)
    const currentLangCode = currentLanguage === "English" ? "en" : "es";
    
    return (
      <Select onValueChange={handleChange} defaultValue={currentLangCode}>
        <SelectTrigger className={`${clientWidth < 380 ? "w-[60px]" : clientWidth < 400 ? "w-[65px]" : clientWidth < 450 ? "w-[70px]" : clientWidth < 500 ? "w-[80px]" : "w-[90px]"} bg-blue-50 flex flex-row items-center justify-center z-[100]`}>
          <div className="flex items-center justify-center">
            <p className={`${clientWidth < 400 ? "text-xl" : clientWidth < 450 ? "text-2xl" : "text-3xl"} leading-none`}>{getFlag(currentLangCode)}</p>
          </div>
          {/* Remove the SelectValue to only show the flag */}
        </SelectTrigger>
        <SelectContent style={{ zIndex: 1000 }}>
          <SelectItem value="es" className="flex flex-row items-center gap-2">
            <span className={`${clientWidth < 400 ? "text-xl" : clientWidth < 450 ? "text-2xl" : "text-3xl"} leading-none`}>🇪🇸</span>
            <span className="my-auto">Español</span>
          </SelectItem>
          <SelectItem value="en" className="flex items-center gap-2">
            <span className={`${clientWidth < 400 ? "text-xl" : clientWidth < 450 ? "text-2xl" : "text-3xl"} leading-none`}>🇬🇧</span>
            <span className="my-auto">English</span>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  };

  return (
    <>
      {clientWidth >= 1280 ? (
        <motion.div 
          className={`w-[95%] max-w-[720px] flex flex-row justify-between items-center h-[80px] backdrop-blur-xl mx-auto p-4 z-[90] rounded-2xl border ${isScrolled ? "fixed" : "absolute"} ${isScrolled ? "top-4" : "top-4"}`}
          style={{ 
            left: "50%", 
            transform: "translateX(-50%)"
          }}
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
            <LanguageSelector />
          <div className="w-[45px]" />
          <img src="/tourtovalencialogo.png" alt="Olga Travel" className={` ${clientWidth < 380 ? "h-[20px]" : "h-[80px]"} py-2 absolute left-1/2 -translate-x-1/2 w-auto`} />
          <div className="flex items-center gap-3">
            <Menu className="text-white cursor-pointer hover:text-blue-200 transition-colors" size={45} onClick={() => setMobileNavOpen(true)} />
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className={`w-[90%] max-w-[920px] flex flex-row justify-between items-center h-[70px] backdrop-blur-xl mx-auto p-6 z-[90] rounded-2xl border ${isScrolled ? "fixed" : "absolute"} ${isScrolled ? "top-4" : "top-4"}`}
          style={{ 
            left: "50%", 
            transform: "translateX(-50%)" 
          }}
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
            <LanguageSelector />
          <img src="/tourtovalencialogo.png" alt="Olga Travel" className={` ${clientWidth < 380 ? "h-[50px]" : clientWidth < 450 ? "h-[50px]" : clientWidth < 500 ? "h-[50px]" : "h-[50px]"}`} />
          <div className="flex items-center gap-3">
            <Menu className="text-white cursor-pointer hover:text-blue-200 transition-colors z-[990]" size={45} onClick={() => setMobileNavOpen(true)} />
          </div>
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
              className="fixed top-0 h-dvh bg-blue-800/80 flex flex-col items-start overflow-y-auto"
              style={{
                width: clientWidth < 400 ? '100%' : '400px',
                right: 0,
                padding: clientWidth < 400 ? '1rem' : clientWidth < 768 ? '2rem' : '4rem',
                maxHeight: '100dvh'
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
            >
              <div className="flex flex-col w-full min-h-full justify-between py-4">
                <div className="flex flex-col gap-6">
                  <img src="/tourtovalencialogo.png" alt="Olga Travel" className={`${clientWidth < 380 ? "h-[60px]" : "h-[80px]"} mx-auto mb-4`} />
                  
                  {/* Regular Nav Links */}
                  <div className="flex flex-col gap-4 w-full">
                    {/* Regular Nav Links - Home */}
                    <motion.div
                      key="home-link"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <button 
                        onClick={() => handleLinkClick(navLinks[0].path)} 
                        className="text-white text-xl hover:text-blue-200 transition-colors text-left w-full"
                      >
                        {navLinks[0].linkText}
                      </button>
                    </motion.div>
                    
                    {/* Tours Dropdown - Placed second */}
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
                              <button
                                onClick={() => handleLinkClick(`/pages/${tour.slug}`)}
                                className="pl-4 text-blue-50 hover:text-blue-200 transition-colors font-sans text-lg block py-2 text-left w-full"
                              >
                                {currentLanguage === "English" ? tour.tourName.en : tour.tourName.es}
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    )}
                    
                    {/* Remaining Nav Links - Book Now and Valencia Things to Do */}
                    {navLinks.slice(1).map((link, index) => {
                      // Skip the Tours link since it's already handled separately
                      if (link.path === "/tours") return null;
                      
                      return (
                        <motion.div
                          key={index + 1}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * (index + 2) }}
                        >
                          <button 
                            onClick={() => handleLinkClick(link.path)} 
                            className="text-white text-xl hover:text-blue-200 transition-colors text-left w-full"
                          >
                            {link.linkText}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="w-full flex justify-between items-center mt-6">
                  <ArrowRightToLine 
                    className="text-blue-950 bg-blue-50 rounded-3xl py-4 px-0 cursor-pointer hover:bg-blue-100 transition-colors" 
                    size={clientWidth < 500 ? 65 : 70} 
                    onClick={() => setMobileNavOpen(false)} 
                  />
                  <button 
                    onClick={() => handleLinkClick("/admin")} 
                    className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors"
                  >
                    <Settings size={20} className="text-blue-100" />
                    <span className="text-blue-100 text-lg font-medium">Admin</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
