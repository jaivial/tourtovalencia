import { motion } from "framer-motion";
import { MutableRefObject } from "react";

type TimelineStep = {
  title: string;
  description: string;
  isActive: boolean;
};

type TimelineUIProps = {
  title: string;
  subtitle: string;
  steps: TimelineStep[];
  stepsRefs: MutableRefObject<(HTMLDivElement | null)[]>;
};

export const TimelineUI = ({ title, subtitle, steps, stepsRefs }: TimelineUIProps) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center mb-3 text-blue-800 tracking-tight"
        >
          {title}
        </motion.h2>
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-blue-600 text-center mb-16 px-4 font-light leading-relaxed"
        >
          {subtitle}
        </motion.h3>
        
        <div className="relative">
          {/* Vertical line - hidden on mobile */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200 rounded-full hidden md:block" />
          
          {/* Mobile vertical line */}
          <div className="absolute left-4 sm:left-8 transform -translate-x-1/2 h-full w-1 bg-gray-200 rounded-full md:hidden" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              ref={el => stepsRefs.current[index] = el}
              className={`flex items-start mb-16 last:mb-0 ${
                // Mobile: always left-aligned, Desktop: alternating
                index % 2 === 0 
                  ? "flex-col md:flex-row" 
                  : "flex-col md:flex-row-reverse"
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ 
                opacity: step.isActive ? 1 : 0.3,
                y: step.isActive ? 0 : 20
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* Mobile timeline dot */}
              <div className="relative flex items-center h-12 md:hidden ml-4 sm:ml-8">
                <div className={`w-6 h-6 rounded-full ${
                  step.isActive ? "bg-blue-600" : "bg-gray-300"
                } transition-all duration-500`} />
                <div className={`absolute w-12 h-12 rounded-full ${
                  step.isActive ? "bg-blue-100" : "bg-gray-100"
                } -z-10 -translate-x-3`} />
              </div>

              {/* Content box - full width on mobile */}
              <div className="w-full md:w-1/2 px-4 sm:px-12 ml-8 md:ml-0">
                <div className={`${
                  step.isActive 
                    ? "bg-blue-600 shadow-blue-200" 
                    : "bg-gray-300"
                } p-6 sm:p-8 rounded-xl shadow-lg transition-all duration-500 transform ${
                  step.isActive ? "scale-[1.02]" : "scale-100"
                }`}>
                  <h4 className="text-xl sm:text-2xl font-bold mb-3 text-white">{step.title}</h4>
                  <p className="text-gray-100 text-base sm:text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>
              
              {/* Desktop timeline dot */}
              <div className="relative hidden md:flex items-center justify-center w-12 h-12">
                <div className={`w-6 h-6 rounded-full ${
                  step.isActive ? "bg-blue-600" : "bg-gray-300"
                } transition-all duration-500 transform ${
                  step.isActive ? "scale-125" : "scale-100"
                }`} />
                <div className={`absolute w-12 h-12 rounded-full ${
                  step.isActive ? "bg-blue-100" : "bg-gray-100"
                } -z-10 transition-all duration-500 transform ${
                  step.isActive ? "scale-110" : "scale-100"
                }`} />
              </div>
              
              {/* Spacer div - only visible on desktop */}
              <div className="hidden md:block md:w-1/2" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 