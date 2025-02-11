// app/components/layout/nav.tsx
import { useState } from "react";
import { Link } from "@remix-run/react";
import { useLocation } from "@remix-run/react";
import { useWindowSize } from "@uidotdev/usehooks";
import { Menu, ArrowRightToLine, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useFetcher } from "@remix-run/react";

const Nav: React.FC = () => {
  const { state, dispatch } = useLanguageContext();
  const fetcher = useFetcher();
  const navLinks = state.links;
  const currentLanguage = state.currentLanguage;
  const flag = state.flag;
  const location = useLocation();
  const size = useWindowSize();
  const width = size.width ?? 0;
  const height = size.height ?? 0;
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [isToursOpen, setIsToursOpen] = useState(false);

  const handleChange = (selectedLanguage: string) => {
    dispatch({ type: "changeLanguage", payload: selectedLanguage });
    fetcher.submit({ language: selectedLanguage }, { method: "post", action: "/set-language" });
  };

  return (
    <>
      {width >= 1280 ? (
        <div className="w-[95%] max-w-[920px] flex flex-row justify-between items-center h-[100px] backdrop-blur-xl mx-auto p-4 absolute top-5 left-0 right-0 z-[90] bg-black/15 rounded-2xl border border-white/20">
          <div className="w-[45px]" />
          <img 
            src="/logonuevoolga3.png" 
            alt="Olga Travel" 
            className="h-[80px] absolute left-1/2 -translate-x-1/2" 
          />
          <Menu 
            className="text-white cursor-pointer hover:text-blue-200 transition-colors" 
            size={45} 
            onClick={() => setMobileNavOpen(true)} 
          />
        </div>
      ) : (
        <div className="w-[100%] max-w-[1280px] flex flex-row justify-between items-center h-[100px] mx-auto p-4 absolute top-0 left-0 right-0 z-10 animate-fadeIn bg-white/10">
          <img 
            src="/logonuevoolga3.png" 
            alt="Olga Travel" 
            className="h-[80px]" 
          />
          <div className="flex items-center gap-4">
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
            <Menu 
              className="text-white cursor-pointer hover:text-blue-200 transition-colors" 
              size={45} 
              onClick={() => setMobileNavOpen(true)} 
            />
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[999] isolate">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className={`fixed right-0 top-0 h-dvh w-[400px] bg-blue-800/90 p-16 flex flex-col items-start justify-between gap-10 transform transition-transform duration-300 ${mobileNavOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <img 
              src="/logonuevoolga3.png" 
              alt="Olga Travel" 
              className="h-[80px]" 
            />
            <div className={`h-full flex flex-col justify-start items-start w-full ${height <= 570 ? "justify-between" : "justify-start gap-14"}`}>
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
                <button
                  onClick={() => setIsToursOpen(!isToursOpen)}
                  className="w-full flex items-center justify-between text-blue-50 font-sans font-semibold text-xl group"
                >
                  Tours
                  <ChevronDown 
                    className={`transition-transform duration-300 ${isToursOpen ? 'rotate-180' : ''}`} 
                    size={20} 
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isToursOpen ? 'max-h-[200px] mt-4' : 'max-h-0'}`}>
                  <Link 
                    to="/sanjuan"
                    className="pl-4 text-blue-50 hover:text-blue-200 transition-colors font-sans text-lg block py-2"
                  >
                    Cuevas de San Juan
                  </Link>
                </div>
              </div>

              {/* Regular Nav Links */}
              {navLinks.map((item) => {
                if (item.linkText !== "Tours") {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link 
                      key={item.linkText} 
                      to={item.path} 
                      className={`font-sans transition-all ease-in-out duration-300 group font-semibold relative ${width <= 350 ? "text-lg" : "text-xl"} ${isActive ? "text-blue-50" : "text-blue-50"}`}
                    >
                      {item.linkText}
                      {!isActive && <span className="absolute left-0 bottom-[-5px] w-0 h-[5px] bg-blue-800 transition-all duration-300 group-hover:w-full"></span>}
                      {isActive && <span className="absolute left-0 bottom-[-5px] h-[5px] bg-white transition-all duration-300 w-full"></span>}
                    </Link>
                  );
                }
                return null;
              })}
            </div>
            <ArrowRightToLine 
              className="text-blue-950 bg-blue-50 rounded-3xl py-4 px-0 mx-auto cursor-pointer hover:bg-blue-100 transition-colors" 
              size={80} 
              onClick={() => setMobileNavOpen(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Nav;
