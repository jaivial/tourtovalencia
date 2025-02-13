import { useEffect, useRef, useState } from "react";
import { TimelineUI } from "./TimelineUI";
import { useLanguageContext } from "~/providers/LanguageContext";

export const TimelineFeature = () => {
  const { state } = useLanguageContext();
  const [activeSteps, setActiveSteps] = useState<boolean[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Initialize activeSteps array based on the number of steps
    setActiveSteps(new Array(state.timeline.steps.length).fill(false));
    
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const windowHeight = window.innerHeight;

      const newActiveSteps = stepsRefs.current.map((stepRef) => {
        if (!stepRef) return false;

        const stepRect = stepRef.getBoundingClientRect();
        const stepMiddle = stepRect.top + stepRect.height / 2;
        
        // Different activation zones for mobile and desktop
        if (isMobile) {
          // Mobile: activate when step is in the middle 50% of the viewport
          const mobileStart = windowHeight * 0.25;
          const mobileEnd = windowHeight * 0.75;
          return stepMiddle > mobileStart && stepMiddle < mobileEnd;
        } else {
          // Desktop: activate when step is in the middle 30% of the viewport
          const desktopStart = windowHeight * 0.35;
          const desktopEnd = windowHeight * 0.65;
          return stepMiddle > desktopStart && stepMiddle < desktopEnd;
        }
      });

      setActiveSteps(newActiveSteps);
    };

    // Initial check
    handleScroll();

    // Use passive listener for better mobile performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [state.timeline.steps.length, isMobile]);

  const stepsWithActive = state.timeline.steps.map((step, index) => ({
    ...step,
    isActive: activeSteps[index] || false
  }));

  return (
    <div className="w-full bg-blue-50">
      <div 
        ref={sectionRef} 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16"
      >
        <TimelineUI
          title={state.timeline.title}
          subtitle={state.timeline.subtitle}
          steps={stepsWithActive}
          stepsRefs={stepsRefs}
        />
      </div>
    </div>
  );
}; 