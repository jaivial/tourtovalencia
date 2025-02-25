import { useEffect, useRef, useState } from "react";
import { TimelineUI } from "./TimelineUI";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Label } from "../ui/label";

export type TimelineDataType = {
  title: string;
  subtitle: string;
  steps: {
    title: string;
    description: string;
  }[];
};

type EditableTimelineFeatureProps = {
  timelineData: TimelineDataType;
  onTimelineUpdate: (field: keyof TimelineDataType, value: string | Array<{title: string, description: string}>) => void;
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTimelineUpdate('title', e.target.value);
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTimelineUpdate('subtitle', e.target.value);
  };

  const handleStepTitleChange = (index: number, value: string) => {
    const updatedSteps = [...timelineData.steps];
    updatedSteps[index] = { ...updatedSteps[index], title: value };
    onTimelineUpdate('steps', updatedSteps);
  };

  const handleStepDescriptionChange = (index: number, value: string) => {
    const updatedSteps = [...timelineData.steps];
    updatedSteps[index] = { ...updatedSteps[index], description: value };
    onTimelineUpdate('steps', updatedSteps);
  };

  const handleAddStep = () => {
    const updatedSteps = [...timelineData.steps, { title: "", description: "" }];
    onTimelineUpdate('steps', updatedSteps);
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = timelineData.steps.filter((_, i) => i !== index);
    onTimelineUpdate('steps', updatedSteps);
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Editar Línea de Tiempo</h2>
      
      <div className="space-y-6 mb-8">
        <div>
          <Label htmlFor="timeline-title" className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </Label>
          <Input 
            id="timeline-title" 
            value={timelineData.title} 
            onChange={handleTitleChange}
            placeholder="Título de la línea de tiempo"
            className="w-full"
          />
        </div>
        
        <div>
          <Label htmlFor="timeline-subtitle" className="block text-sm font-medium text-gray-700 mb-1">
            Subtítulo
          </Label>
          <Input 
            id="timeline-subtitle" 
            value={timelineData.subtitle} 
            onChange={handleSubtitleChange}
            placeholder="Subtítulo de la línea de tiempo"
            className="w-full"
          />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Pasos</h3>
      
      <div className="space-y-6 mb-6">
        {timelineData.steps.map((step, index) => (
          <div key={index} className="p-4 border rounded-lg bg-gray-50 relative">
            <button 
              onClick={() => handleRemoveStep(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              type="button"
              aria-label="Eliminar paso"
            >
              <TrashIcon size={18} />
            </button>
            
            <div className="mb-4">
              <Label htmlFor={`step-title-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                Título del Paso {index + 1}
              </Label>
              <Input 
                id={`step-title-${index}`} 
                value={step.title} 
                onChange={(e) => handleStepTitleChange(index, e.target.value)}
                placeholder="Título del paso"
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor={`step-description-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Paso {index + 1}
              </Label>
              <Textarea 
                id={`step-description-${index}`} 
                value={step.description} 
                onChange={(e) => handleStepDescriptionChange(index, e.target.value)}
                placeholder="Descripción del paso"
                className="w-full"
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        onClick={handleAddStep}
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
      >
        <PlusIcon size={16} />
        Añadir Paso
      </Button>
      
      <div className="mt-8 border-t pt-8">
        <h3 className="text-xl font-semibold mb-4">Vista Previa</h3>
        <div 
          ref={sectionRef} 
          className="bg-blue-50 p-6 rounded-lg"
        >
          <TimelineUI
            title={timelineData.title}
            subtitle={timelineData.subtitle}
            steps={stepsWithActive}
            stepsRefs={stepsRefs}
          />
        </div>
      </div>
    </div>
  );
}; 