//UI Component: just responsible for displaying pure html with props passed from feature component
import { HeroSectionType } from "~/data/data";
// Child Props type
type ChildProps = {
  width: number;
  height: number;
  heroSectionText: HeroSectionType;
};

const HeroSection: React.FC<ChildProps> = ({ width, height, heroSectionText }) => {
  return (
    <div className="w-full bg-[url('/hero1Copia.jpg')] max-h-[1025px] flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat z-[1]">
      <div className="w-[90%] max-w-[1280px] h-dvh flex flex-col justify-center items-center">
        <h2 className={`${width <= 350 ? "text-[3rem]" : width <= 450 ? "text-[3.5rem]" : width <= 768 ? "text-[3.8rem]" : width <= 1024 ? "text-[5rem]" : width <= 1280 ? "text-[6rem]" : "text-[7rem]"} font-bold font-sans text-white text-center drop-shadow-md tracking-wide`}>
          <span className="text-orange-400">{heroSectionText.firstH2Orange}</span> {heroSectionText.firstH2}
        </h2>
        <h3 className={`${width <= 350 ? "text-[1.4rem]" : width <= 450 ? "text-[2rem]" : width <= 768 ? "text-[2.3rem]" : width <= 1024 ? "text-[3rem]" : width <= 1280 ? "text-[3rem]" : "text-[4rem]"} font-bold font-sans text-white text-center drop-shadow-xl translate-y-5`}>{heroSectionText.firstH3}</h3>
        <h3 className={`${width <= 350 ? "text-[1.4rem] translate-y-8" : width <= 450 ? "text-[2rem] translate-y-8" : width <= 768 ? "text-[2.3rem] translate-y-8" : width <= 1024 ? "text-[3rem] translate-y-10" : width <= 1280 ? "text-[3rem] translate-y-12" : "text-[4rem] translate-y-16"} font-bold font-sans text-white text-center drop-shadow-xl `}>
          {heroSectionText.secondH3}
        </h3>
      </div>
    </div>
  );
};

export default HeroSection;
