import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MutableRefObject } from "react";
import EditableText from "../_pagegen/EditableText";

export type TimelineDataType = {
  title: string;
  subtitle: string;
  steps: {
    title: string;
    description: string;
    isActive?: boolean;
  }[];
};

type EditableTimelineFeatureProps = {
  timelineData: TimelineDataType;
  onTimelineUpdate: (field: keyof TimelineDataType, value: string | Array<{title: string, description: string}>) => void;
};

// Editable version of TimelineUI that allows inline editing
const EditableTimelineUI = ({ 
  timelineData, 
  onTimelineUpdate,
  stepsRefs 
}: { 
  timelineData: TimelineDataType; 
  onTimelineUpdate: EditableTimelineFeatureProps['onTimelineUpdate']; 
  stepsRefs: MutableRefObject<(HTMLDivElement | null)[]>;
}) => {
  const handleTitleUpdate = (value: string) => {
    onTimelineUpdate('title', value);
  };

  const handleSubtitleUpdate = (value: string) => {
    onTimelineUpdate('subtitle', value);
  };

  const handleStepTitleUpdate = (index: number) => (value: string) => {
    const updatedSteps = [...timelineData.steps];
    updatedSteps[index] = { ...updatedSteps[index], title: value };
    onTimelineUpdate('steps', updatedSteps);
  };

  const handleStepDescriptionUpdate = (index: number) => (value: string) => {
    const updatedSteps = [...timelineData.steps];
    updatedSteps[index] = { ...updatedSteps[index], description: value };
    onTimelineUpdate('steps', updatedSteps);
  };

  const handleAddStep = () => {
    const updatedSteps = [...timelineData.steps, { title: "New Step", description: "Step description" }];
    onTimelineUpdate('steps', updatedSteps);
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = timelineData.steps.filter((_, i) => i !== index);
    onTimelineUpdate('steps', updatedSteps);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center mb-3 text-blue-800 tracking-tight"
        >
          <EditableText
            value={timelineData.title}
            onUpdate={handleTitleUpdate}
            placeholder="Timeline Title"
            className="text-4xl md:text-5xl font-bold text-center text-blue-800 tracking-tight"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-blue-600 text-center mb-16 px-4 font-light leading-relaxed"
        >
          <EditableText
            value={timelineData.subtitle}
            onUpdate={handleSubtitleUpdate}
            placeholder="Timeline Subtitle"
            className="text-xl md:text-2xl text-blue-600 text-center font-light leading-relaxed"
          />
        </motion.div>
        
        <div className="relative">
          {/* Vertical line - hidden on mobile */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200 rounded-full hidden md:block" />
          
          {/* Mobile vertical line */}
          <div className="absolute left-4 sm:left-8 transform -translate-x-1/2 h-full w-1 bg-gray-200 rounded-full md:hidden" />
          
          {timelineData.steps.map((step, index) => (
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
                opacity: step.isActive ? 1 : 0.7,
                y: 0
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
              <div className="w-full md:w-1/2 px-4 sm:px-12 ml-8 md:ml-0 relative">
                <div className={`${
                  step.isActive 
                    ? "bg-blue-600 shadow-blue-200" 
                    : "bg-gray-300"
                } p-6 sm:p-8 rounded-xl shadow-lg transition-all duration-500 transform ${
                  step.isActive ? "scale-[1.02]" : "scale-100"
                }`}>
                  <EditableText
                    value={step.title}
                    onUpdate={handleStepTitleUpdate(index)}
                    placeholder="Step Title"
                    className="text-xl sm:text-2xl font-bold mb-3 text-white"
                  />
                  <EditableText
                    value={step.description}
                    onUpdate={handleStepDescriptionUpdate(index)}
                    placeholder="Step Description"
                    className="text-gray-100 text-base sm:text-lg leading-relaxed"
                    multiline={true}
                  />
                </div>
                
                {/* Remove step button */}
                <button 
                  onClick={() => handleRemoveStep(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Remove step"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
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
        
        {/* Add step button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleAddStep}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Step
          </button>
        </div>
      </div>
    </section>
  );
};

export const EditableTimelineFeature = ({ timelineData, onTimelineUpdate }: EditableTimelineFeatureProps) => {
  const [activeSteps, setActiveSteps] = useState<boolean[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Initialize activeSteps array based on the number of steps
    setActiveSteps(new Array(timelineData.steps.length).fill(false));
    
    // Set the first step as active for preview purposes
    if (timelineData.steps.length > 0) {
      setActiveSteps(prev => {
        const newActiveSteps = [...prev];
        newActiveSteps[0] = true;
        return newActiveSteps;
      });
    }
  }, [timelineData.steps.length]);

  const stepsWithActive = timelineData.steps.map((step, index) => ({
    ...step,
    isActive: activeSteps[index] || false
  }));

  // Update the timelineData with active steps
  const timelineDataWithActive = {
    ...timelineData,
    steps: stepsWithActive
  };

  return (
    <div className="w-full mx-auto max-w-[95%]">
      <div 
        ref={sectionRef} 
        className="w-full px-4 py-8"
      >
        <EditableTimelineUI
          timelineData={timelineDataWithActive}
          onTimelineUpdate={onTimelineUpdate}
          stepsRefs={stepsRefs}
        />
      </div>
    </div>
  );
}; 