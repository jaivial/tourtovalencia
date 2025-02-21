import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import PageTemplate from "~/components/_pagegen/PageTemplate";
import { IndexSection5Type, sanJuanSection1Type, sanJuansection2Type } from "~/data/data";

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

const DEFAULT_SECTION2_DATA: sanJuansection2Type = {
  firstH3: "",
  secondH3: "",
  thirdH3: "",
  sectionImage: {
    preview: '/olgaphoto3.jpeg'
  }
};

const DEFAULT_INDEX_SECTION5_DATA: IndexSection5Type = {
  firstH3: "",
  secondH3: ""
};

export default function PageGeneratorRoute() {
  const [step, setStep] = useState<'options' | 'name' | 'preview'>('options');
  const [pageName, setPageName] = useState('');
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [status, setStatus] = useState<'active' | 'upcoming'>('upcoming');
  const [section1Data, setSection1Data] = useState<sanJuanSection1Type>(DEFAULT_SECTION1_DATA);
  const [section2Data, setSection2Data] = useState<sanJuansection2Type>(DEFAULT_SECTION2_DATA);
  const [indexSection5Data, setIndexSection5Data] = useState<IndexSection5Type>(DEFAULT_INDEX_SECTION5_DATA);

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

  const handleIndexSection5Update = (field: keyof IndexSection5Type, value: string) => {
    setIndexSection5Data(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSection1Update = (field: keyof sanJuanSection1Type, value: string | { file?: File; preview: string }) => {
    setSection1Data(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSection2Update = (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string }) => {
    setSection2Data(prev => ({
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

  const handleCreate = () => {
    setStep('name');
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
        className="space-y-8"
      >
        {step === 'options' && (
          <motion.div
            variants={buttonVariants}
            className="space-y-4"
          >
            <Button 
              onClick={() => setStep('name')}
              className="w-full py-8 text-xl"
            >
              Crear nueva página
            </Button>
            <Button 
              variant="outline"
              className="w-full py-8 text-xl"
            >
              Administrar páginas
            </Button>
          </motion.div>
        )}

        {step === 'name' && (
          <motion.div
            variants={formVariants}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="pageName" className="text-lg font-medium">
                Nombre de la página
              </label>
              <input
                id="pageName"
                type="text"
                value={pageName}
                onChange={(e) => setPageName(e.target.value.replace(/\s+/g, '_'))}
                className="w-full p-2 border rounded"
                placeholder="mi_nueva_pagina"
              />
            </div>
            <div className="flex justify-between">
              <Button onClick={handleBack} variant="outline">
                Atrás
              </Button>
              <Button onClick={handleNext}>
                Siguiente
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div
            variants={formVariants}
            className="space-y-8"
          >
            <div className="flex justify-between mb-4">
              <Button onClick={handleBack} variant="outline">
                Atrás
              </Button>
              <Button>
                Guardar página
              </Button>
            </div>

            <PageTemplate
              status={status}
              onStatusChange={handleStatusChange}
              indexSection5Data={indexSection5Data}
              onIndexSection5Update={handleIndexSection5Update}
              section1Data={section1Data}
              onSection1Update={handleSection1Update}
              section2Data={section2Data}
              onSection2Update={handleSection2Update}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
