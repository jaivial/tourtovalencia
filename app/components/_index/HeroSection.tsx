//UI Component: just responsible for displaying pure html with props passed from feature component

// Child Props type
type ChildProps = {
  width: number;
  height: number;
};

const HeroSection: React.FC<ChildProps> = ({ width, height }) => {
  return (
    <div className="w-full bg-[url('/hero1Copia.jpg')] h- max-h-[1025px] flex flex-col justify-center items-center bg-auto bg-no-repeat">
      <div className="w-[90%] max-w-[1280px] h-dvh flex flex-col justify-center items-center">
        <h2 className={`${width <= 350 ? "text-[3rem]" : width <= 450 ? "text-[3.5rem]" : width <= 768 ? "text-[3.8rem]" : width <= 1024 ? "text-[5rem]" : width <= 1280 ? "text-[6rem]" : "text-[7rem]"} font-bold font-sans text-white text-center drop-shadow-md tracking-wide`}>
          <span className="text-orange-400">CUEVAS</span> DE SAN JUAN
        </h2>
        <h3 className={`${width <= 350 ? "text-[1.4rem]" : width <= 450 ? "text-[2rem]" : width <= 768 ? "text-[2.3rem]" : width <= 1024 ? "text-[3rem]" : width <= 1280 ? "text-[3rem]" : "text-[4rem]"} font-bold font-sans text-white text-center drop-shadow-xl translate-y-5`}>EXCURSIÓN Y VIAJE EN BARCA</h3>
        <h3 className={`${width <= 350 ? "text-[1.4rem] translate-y-8" : width <= 450 ? "text-[2rem] translate-y-8" : width <= 768 ? "text-[2.3rem] translate-y-8" : width <= 1024 ? "text-[3rem] translate-y-10" : width <= 1280 ? "text-[3rem] translate-y-12" : "text-[4rem] translate-y-16"} font-bold font-sans text-white text-center drop-shadow-xl `}>DESDE VALENCIA</h3>
      </div>
    </div>
  );
};

export default HeroSection;
