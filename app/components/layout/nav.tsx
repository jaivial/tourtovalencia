// app/components/layout/nav.tsx
import { useState } from "react";
import { Link } from "@remix-run/react";
import { NavType, NavData } from "~/data/nav";
import { useLoaderData, useLocation } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { useWindowSize } from "@uidotdev/usehooks";
import { Menu } from "lucide-react";

// UI component: Just for displaying html
const Nav: React.FC = () => {
  const location = useLocation();
  const size = useWindowSize();
  const width = size.width ?? 0;
  const height = size.height ?? 0;
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  return (
    <>
      {width >= 1280 ? (
        <div className="w-[95%] max-w-[1280px] bg-teal-300 flex flex-row justify-evenly items-center h-[100px] mx-auto p-4 fixed top-0 left-0 right-0">
          <img src="/logoolgatravel.webp" alt="Olga Travel, excursion to San Juan caves from Valencia. Boat travel in San Juan Caves. Viajes en barca en las cuevas de San Juan Valencia." className="h-full" />
          <p>{size.width}</p>
          <div className="flex flex-row items-center justify-between gap-16">
            {NavData.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.linkText} to={item.path} className={`font-sans transition-all ease-in-out duration-300 group font-semibold relative text-xl ${isActive ? "text-orange-50 md:hover:text-orange-950" : "text-orange-950"}`}>
                  {item.linkText}
                  {!isActive && <span className="absolute left-0 bottom-[-5px] w-0 h-[5px] bg-orange-800 transition-all duration-300 group-hover:w-full"></span>}
                  {isActive && <span className="absolute left-0 bottom-[-5px] h-[5px] bg-orange-800 transition-all duration-300 w-full"></span>}
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={`w-[100%] max-w-[1280px] bg-teal-300 flex flex-row justify-center items-center h-[100px] mx-auto p-4 fixed top-0 left-0 right-0`}>
          <img src="/logoolgatravel.webp" alt="Olga Travel, excursion to San Juan caves from Valencia. Boat travel in San Juan Caves. Viajes en barca en las cuevas de San Juan Valencia." className={`${width <= 350 ? "h-[80%]" : width <= 450 ? "h-[90%]" : "h-full"}`} />
          <Menu className={`absolute z-[10] ${width <= 450 ? "right-4" : "right-20"}`} size={width <= 350 ? 40 : 45} onClick={() => setMobileNavOpen(true)} />
          <div className={`fixed top-0 w-full h-full transition-all ease-in-out duration-500 bg-slate-600 ${mobileNavOpen ? "bg-opacity-35 z-[999]" : "bg-opacity-0 z-[1]"}`} onClick={() => setMobileNavOpen(false)}>
            <div className={`flex flex-col transition-all ease-in-out duration-500 fixed right-0 h-dvh p-16 bg-orange-800 items-start justify-between gap-10 ${mobileNavOpen ? "max-w-[400px] h-dvh translate-x-0 opacity-100" : "w-0 translate-x-[100%] opacity-0"}`}>
              <img src="/logoolgatravel.webp" alt="Olga Travel, excursion to San Juan caves from Valencia. Boat travel in San Juan Caves. Viajes en barca en las cuevas de San Juan Valencia." className="h-auto w-auto invert brightness-0" />
              <div className={`h-full flex flex-col justify-start items-start w-full ${height <= 570 ? "justify-between" : "justify-start gap-14"}`}>
                {NavData.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.linkText} to={item.path} className={`font-sans transition-all ease-in-out duration-300 group font-semibold relative  ${width <= 350 ? "text-lg" : "text-xl"} ${isActive ? "text-orange-50 md:hover:text-orange-950" : "text-orange-50"}`}>
                      {item.linkText}
                      {!isActive && <span className="absolute left-0 bottom-[-5px] w-0 h-[5px] bg-orange-800 transition-all duration-300 group-hover:w-full"></span>}
                      {isActive && <span className="absolute left-0 bottom-[-5px] h-[5px] bg-white transition-all duration-300 w-full"></span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Nav;
