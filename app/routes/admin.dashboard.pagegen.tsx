import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import PageTemplate from "~/components/_pagegen/PageTemplate";
import { sanJuanSection1Type } from "~/data/data";

type Section = {
  id: string;
  title: string;
  content: string;
};

const DEFAULT_SECTIONS: Section[] = [
  { id: 'section1', title: '', content: '' },
  { id: 'section2', title: '', content: '' },
  { id: 'section3', title: '', content: '' },
  { id: 'section4', title: '', content: '' },
];

const DEFAULT_SECTION1_DATA: sanJuanSection1Type = {
  firstH3: "",
  firstSquareH3: "",
  firstSquareP: "",
  secondSquareH3: "",
  secondSquareP: "",
  thirdSquareH3: "",
  thirdSquareP: "",
  button: "",
  backgroundImage: {
    preview: '/olgaphoto3.jpeg'
  }
};

export default function PageGeneratorRoute() {
  const [step, setStep] = useState<'options' | 'name' | 'preview'>('options');
  const [pageName, setPageName] = useState('');
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [status, setStatus] = useState<'active' | 'upcoming'>('upcoming');
  const [section1Data, setSection1Data] = useState<sanJuanSection1Type>(DEFAULT_SECTION1_DATA);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const buttonVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 }
  };

  const formVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
  };

  const handleUpdateSection = (id: string, field: 'title' | 'content', value: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const handleSection1Update = (field: keyof sanJuanSection1Type, value: string | { file?: File; preview: string }) => {
    setSection1Data(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (step === 'name') {
      if (!pageName.trim()) {
        // TODO: Add error handling
        return;
      }
      setStep('preview');
    }
  };

  const handleBack = () => {
    if (step === 'name') {
      setStep('options');
    } else if (step === 'preview') {
      setStep('name');
    }
  };

  const handleStatusChange = (checked: boolean) => {
    setStatus(checked ? 'active' : 'upcoming');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Generador de páginas</h1>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-6"
      >
        {step === 'options' ? (
          <motion.div
            variants={buttonVariants}
            className="flex flex-col space-y-4"
          >
            <Button
              onClick={() => setStep('name')}
              size="lg"
              className="w-full py-8 text-xl"
            >
              Crear nueva página
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full py-8 text-xl"
            >
              Administrar páginas
            </Button>
          </motion.div>
        ) : step === 'name' ? (
          <motion.div
            variants={formVariants}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Nombre de la página</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Ingrese el nombre de la página"
                className="w-full p-3 border rounded-md"
                value={pageName}
                onChange={(e) => setPageName(e.target.value.replace(/\s+/g, '_'))}
              />
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                >
                  Volver
                </Button>
                <Button onClick={handleNext}>
                  Siguiente
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={formVariants}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                Volver
              </Button>
              <Button>
                Guardar página
              </Button>
            </div>
            <div className="bg-blue-50">
              <PageTemplate
                sections={sections}
                onUpdateSection={handleUpdateSection}
                status={status}
                onStatusChange={handleStatusChange}
                section1Data={section1Data}
                onSection1Update={handleSection1Update}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
