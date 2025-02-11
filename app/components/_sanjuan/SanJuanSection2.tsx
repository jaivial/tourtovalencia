// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { sanJuansection2Type } from "~/data/data";

// Child Props type
type ChildProps = {
  width: number;
  height: number;
  SanJuanSection2Text: sanJuansection2Type;
};

const SanJuanSection2: React.FC<ChildProps> = ({ width, height, SanJuanSection2Text }) => {   
  return (
    <div className={`w-[95%] max-w-[1280px] flex flex-row flex-wrap-reverse items-center justify-center my-10 mx-auto relative z-0 ${width <= 1280 ? "gap-0" : "gap-10"}`}>
      <div className={`w-full max-w-[620px] min-h-[600px] flex flex-col justify-center items-center p-6 gap-8 -translate-y-[50px]`}>
        <DotLottieReact src="https://lottie.host/c75de82a-9932-4b71-b021-22934b5e5b17/QbeG97Ss7A.lottie" loop autoplay className={`translate-y-[50px] ${width <= 450 ? "w-[350px]" : "w-[400px] "}`} />
        <h3 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-medium ${width <= 350 ? "text-[1.3rem]" : width <= 450 ? "text-[1.4rem]" : "text-[1.8rem]"} text-center`}>{SanJuanSection2Text.firstH3}</h3>
        <h3 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-medium ${width <= 350 ? "text-[1.3rem]" : width <= 450 ? "text-[1.4rem]" : "text-[1.8rem]"} text-center`}>{SanJuanSection2Text.secondH3}</h3>
        <h3 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-medium ${width <= 350 ? "text-[1.3rem]" : width <= 450 ? "text-[1.4rem]" : "text-[1.8rem]"} text-center`}>{SanJuanSection2Text.thirdH3}</h3>
      </div>
      <div className={`w-full max-w-[620px] p-0 flex flex-col justify-center items-center relative ${width <= 1280 ? "h-fit" : "h-[600px]"}`}>
        <img src="/photo1IndexSection2.webp" alt="Cuevas de San Juan, visita guiada y viaje en barca." className="w-full h-auto rounded-2xl" />
      </div>
    </div>
  );
};

export default SanJuanSection2;
