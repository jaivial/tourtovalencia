// app/components/layout/nav.tsx
import { useState, useEffect } from "react";
import { Menu, ArrowRightToLine, ChevronDown, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useFetcher, Link, useLocation, useLoaderData } from "@remix-run/react";
import { DynamicNavLinks } from "./DynamicNavLinks";
import type { Page } from "~/utils/db.schema.server";

interface NavProps {
  pages: Page[];
}

const Nav: React.FC<NavProps> = ({ pages }) => {
  const { state, dispatch } = useLanguageContext();
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

  useEffect(() => {
    setIsMounted(true);
    const updateSize = () => {
      setClientWidth(window.innerWidth);
      setClientHeight(window.innerHeight);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
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

  return (
    <>
      {clientWidth >= 1280 ? (
        <div className="w-[95%] max-w-[920px] flex flex-row justify-between items-center h-[100px] backdrop-blur-xl mx-auto p-4 absolute top-5 left-0 right-0 z-[90] bg-black/15 rounded-2xl border border-white/20">
          <div className="w-[45px]" />
          <img src="/logonuevoolga3.png" alt="Olga Travel" className={` ${clientWidth < 380 ? "h-[20px]" : "h-[100px]"} py-3 absolute left-1/2 -translate-x-1/2 w-auto`} />
          <Menu className="text-white cursor-pointer hover:text-blue-200 transition-colors" size={45} onClick={() => setMobileNavOpen(true)} />
        </div>
      ) : (
        <div className="w-[90%] max-w-[920px] flex flex-row justify-between items-center h-[100px] backdrop-blur-xl left-1/2 -translate-x-1/2 p-6 absolute top-5 z-[90] bg-black/15 rounded-2xl border border-white/20">
          <img src="/logonuevoolga3.png" alt="Olga Travel" className={` ${clientWidth < 380 ? "h-[50px]" : clientWidth < 450 ? "h-[60px]" : clientWidth < 500 ? "h-[70px]" : "h-[80px]"}`} />
          <Menu className="text-white cursor-pointer hover:text-blue-200 transition-colors z-[990]" size={45} onClick={() => setMobileNavOpen(true)} />
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[999] isolate">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} onKeyDown={(e) => e.key === "Escape" && setMobileNavOpen(false)} role="button" tabIndex={0} />
          <div className={`fixed right-0 top-0 h-dvh w-[400px] bg-blue-800/90 p-16 flex flex-col items-start justify-between gap-10 transform transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "translate-x-full"}`}>
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

              {/* Tours Dropdown */}
              <div className="w-full">
                <button onClick={() => setIsToursOpen(!isToursOpen)} className="w-full flex items-center justify-between text-blue-50 font-sans font-semibold text-xl group">
                  Tours
                  <ChevronDown className={`transition-transform duration-300 ${isToursOpen ? "rotate-180" : ""}`} size={20} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isToursOpen ? "max-h-[200px] mt-4" : "max-h-0"}`}>
                  <Link to="/sanjuan" onClick={handleLinkClick} className="pl-4 text-blue-50 hover:text-blue-200 transition-colors font-sans text-lg block py-2">
                    {state.common.toursMenu.caves}
                  </Link>
                  <DynamicNavLinks pages={pages} onLinkClick={handleLinkClick} />
                </div>
              </div>

              {/* Regular Nav Links */}
              <div className="flex flex-col gap-6">
                {navLinks.map((link, index) => (
                  <Link key={index} to={link.path} onClick={handleLinkClick} className="text-white text-2xl hover:text-blue-200 transition-colors">
                    {link.linkText}
                  </Link>
                ))}
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <ArrowRightToLine className="text-blue-950 bg-blue-50 rounded-3xl py-4 px-0 cursor-pointer hover:bg-blue-100 transition-colors" size={80} onClick={() => setMobileNavOpen(false)} />
              <Link to="/admin" onClick={handleLinkClick} className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors">
                <Settings size={20} className="text-blue-100" />
                <span className="text-blue-100 text-lg font-medium">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Nav;
