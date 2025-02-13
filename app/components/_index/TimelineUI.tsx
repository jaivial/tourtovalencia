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
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-2">{title}</h2>
        <h3 className="text-2xl text-gray-600 text-center mb-12">{subtitle}</h3>
        
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              ref={el => stepsRefs.current[index] = el}
              className={`flex items-center mb-12 ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: step.isActive ? 1 : 0.5,
                y: 0 
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-1/2 px-8">
                <div className={`${
                  step.isActive ? "bg-blue-600" : "bg-gray-300"
                } p-6 rounded-lg shadow-lg transition-colors duration-300`}>
                  <h4 className="text-xl font-bold mb-2 text-white">{step.title}</h4>
                  <p className="text-gray-100">{step.description}</p>
                </div>
              </div>
              
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className={`w-4 h-4 rounded-full ${
                  step.isActive ? "bg-blue-600" : "bg-gray-300"
                } transition-colors duration-300`} />
              </div>
              
              <div className="w-1/2" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 