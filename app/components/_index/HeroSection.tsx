//UI Component: just responsible for displaying pure html with props passed from feature component

const HeroSection: React.FC = () => {
  return (
    <div className="w-full bg-[url('/hero1Copia.jpg')] h-svh flex flex-col justify-center items-center bg-auto bg-no-repeat">
      <div className="w-full">
        <h2 className="text-[7rem] font-bold font-sans text-white text-center drop-shadow-md tracking-wide">
          <span className="text-orange-400">CUEVAS</span> DE SAN JUAN
        </h2>
        <h3 className="text-[4rem] font-bold font-sans text-white text-center drop-shadow-xl text-nowrap translate-y-5">EXCURSIÓN Y VIAJE EN BARCA</h3>
        <h3 className="text-[4rem] font-bold font-sans text-white text-center drop-shadow-xl text-nowrap translate-y-16">DESDE VALENCIA</h3>
      </div>
    </div>
  );
};

export default HeroSection;
