import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

type ChildProps = {
  width: number;
  height: number;
};

const SanJuanSection1: React.FC<ChildProps> = ({ width, height }) => {
  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background image with parallax effect */}
      <div 
        className="absolute inset-0 bg-[url('/hero1Copia.webp')] bg-cover bg-center transform scale-110"
        style={{ height: height }}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent"
        />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 max-w-5xl mx-auto"
      >
        <DotLottieReact 
          src="https://lottie.host/2a175610-d81d-4fe8-8a4d-457c27665617/7LB2k4w3Yl.lottie"
          loop 
          autoplay 
          className={`${width <= 500 ? "w-[300px]" : "w-[400px]"} mb-8 drop-shadow-2xl`}
        />
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className={`font-bold mb-8 drop-shadow-2xl ${
            width <= 350 ? "text-5xl" : 
            width <= 640 ? "text-6xl" : 
            "text-7xl"
          } bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent`}
        >
          Cuevas de San Juan
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className={`max-w-3xl drop-shadow-lg font-medium mb-8 ${
            width <= 350 ? "text-xl" : 
            width <= 640 ? "text-2xl" : 
            "text-3xl"
          } text-blue-50`}
        >
          Descubre la magia subterránea de Valencia en un viaje único por las Cuevas de San Juan
        </motion.p>

        {/* New feature highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-4xl"
        >
          {[
            { title: "2.5 Horas", desc: "Duración del Tour" },
            { title: "Guía Local", desc: "Tour Privado" },
            { title: "Viaje en Barca", desc: "Experiencia Única" }
          ].map((feature, index) => (
            <div key={index} className="backdrop-blur-sm bg-white/10 rounded-xl p-4 transform hover:scale-105 transition-transform">
              <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-blue-100">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <Button 
            className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/20 px-8 py-6 text-xl rounded-full group transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
          >
            Reserva Ahora
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          delay: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 1
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <DotLottieReact 
          src="https://lottie.host/14a6c8c8-3ab3-4f34-9937-a2426f2c8b42/s1k5rXKwPF.lottie"
          loop 
          autoplay 
          className="w-[50px] drop-shadow-lg"
        />
      </motion.div>
    </div>
  );
};

export default SanJuanSection1; 