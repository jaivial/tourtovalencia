import { useEffect, useRef, useState } from "react";
import { TimelineUI } from "./TimelineUI";
import { useLanguageContext } from "~/providers/LanguageContext";

export const TimelineFeature = () => {
  const { state } = useLanguageContext();
  const [activeSteps, setActiveSteps] = useState<boolean[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Initialize activeSteps array based on the number of steps
    setActiveSteps(new Array(state.timeline.steps.length).fill(false));
    
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const sectionTop = sectionRef.current.offsetTop;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      const newActiveSteps = stepsRefs.current.map((stepRef, index) => {
        if (!stepRef) return false;

        const stepTop = stepRef.offsetTop - sectionTop;
        const stepHeight = stepRef.offsetHeight;
        
        return (
          scrollY + windowHeight > sectionTop + stepTop + stepHeight * 0.3 &&
          scrollY < sectionTop + stepTop + stepHeight * 0.7
        );
      });

      setActiveSteps(newActiveSteps);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [state.timeline.steps.length]);

  const stepsWithActive = state.timeline.steps.map((step, index) => ({
    ...step,
    isActive: activeSteps[index] || false
  }));

  return (
    <div ref={sectionRef}>
      <TimelineUI
        title={state.timeline.title}
        subtitle={state.timeline.subtitle}
        steps={stepsWithActive}
        stepsRefs={stepsRefs}
      />
    </div>
  );
}; 