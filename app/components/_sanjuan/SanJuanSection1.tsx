import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type ChildProps = {
  width: number;
  height: number;
};

const SanJuanSection1: React.FC<ChildProps> = ({ width, height }) => {
  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-[url('/sanjuan-hero.webp')] bg-cover bg-center"
        style={{ height: height }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4">
        <DotLottieReact 
          src="https://lottie.host/2a175610-d81d-4fe8-8a4d-457c27665617/7LB2k4w3Yl.lottie"
          loop 
          autoplay 
          className={`${width <= 500 ? "w-[300px]" : "w-[400px]"} mb-6`}
        />
        <h1 className={`font-bold mb-4 ${
          width <= 350 ? "text-3xl" : 
          width <= 640 ? "text-4xl" : 
          "text-5xl"
        }`}>
          Cuevas de San Juan
        </h1>
        <p className={`max-w-2xl ${
          width <= 350 ? "text-lg" : 
          width <= 640 ? "text-xl" : 
          "text-2xl"
        }`}>
          Descubre la magia subterránea de Valencia en un viaje único por las Cuevas de San Juan
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <DotLottieReact 
          src="https://lottie.host/14a6c8c8-3ab3-4f34-9937-a2426f2c8b42/s1k5rXKwPF.lottie"
          loop 
          autoplay 
          className="w-[50px]"
        />
      </div>
    </div>
  );
};

export default SanJuanSection1; 