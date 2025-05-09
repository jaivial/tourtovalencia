import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import type { sanJuanSection1Type } from "~/data/data";
import { useSanJuanSection1 } from "./SanJuanSection1.hooks";
import { Link } from "@remix-run/react";

type SanJuanSection1Props = {
  width: number;
  sanJuanSection1Text: sanJuanSection1Type;
};

const SanJuanSection1: React.FC<SanJuanSection1Props> = ({ width, sanJuanSection1Text }) => {
  const { backgroundStyle } = useSanJuanSection1(sanJuanSection1Text);

  return (
    <div className="w-[95%] max-w-[1280px] flex flex-row flex-wrap items-center justify-center mb-10 mx-auto relative z-0">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="w-full flex flex-col items-center justify-center max-w-[1180px] gap-0 bg-white rounded-3xl p-0 shadow-lg">
        {/* Background image with overlay */}
        <div className="w-full h-[600px] relative bg-white rounded-2xl overflow-hidden mb-0 px-12">
          <div 
            style={backgroundStyle} 
            className={`absolute inset-0 bg-cover bg-bottom transform transition-transform duration-700 rounded-2xl bg-white ${width <= 700 ? "m-0" : "m-8"}`}
          ></div>
        </div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="flex flex-col items-center text-center gap-8 max-w-4xl mt-10 p-6">
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} viewport={{ once: true }} className={`max-w-3xl font-medium ${width <= 350 ? "text-xl" : width <= 640 ? "text-2xl" : "text-3xl"} text-blue-900`}>
            {sanJuanSection1Text.firstH3}
          </motion.p>

          {/* Feature highlights */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 w-full">
            {[
              { title: sanJuanSection1Text.firstSquareH3, desc: sanJuanSection1Text.firstSquareP },
              { title: sanJuanSection1Text.secondSquareH3, desc: sanJuanSection1Text.secondSquareP },
              { title: sanJuanSection1Text.thirdSquareH3, desc: sanJuanSection1Text.thirdSquareP },
            ].map((feature, index) => (
              <div key={index} className="bg-blue-50/50 rounded-xl p-6 transform hover:scale-105 transition-transform">
                <h3 className="text-2xl font-bold text-blue-900 mb-2">{feature.title}</h3>
                <p className="text-blue-800">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} viewport={{ once: true }}>
            <Link to="/book">
              <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-xl rounded-full group transition-all duration-300 hover:shadow-lg">
                {sanJuanSection1Text.button}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SanJuanSection1;
