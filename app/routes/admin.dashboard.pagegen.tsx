import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import PageTemplate from "~/components/_pagegen/PageTemplate";
import { IndexSection5Type, sanJuanSection1Type, sanJuanSection3Type, sanJuansection2Type, sanJuansection4Type } from "~/data/data";

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

const DEFAULT_SECTION3_DATA: sanJuanSection3Type = {
  images: Array(8).fill({ source: "", alt: "Gallery image" }),
  source: "",
  alt: ""
};

const DEFAULT_SECTION4_DATA: sanJuansection4Type = {
  firstH3: "",
  secondH3: "",
  thirdH3: ""
};

export default function PageGeneratorRoute() {
  const [step, setStep] = useState<'options' | 'name' | 'preview'>('options');
  const [pageName, setPageName] = useState('');
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [status, setStatus] = useState<'active' | 'upcoming'>('upcoming');
  const [section1Data, setSection1Data] = useState<sanJuanSection1Type>(DEFAULT_SECTION1_DATA);
  const [section2Data, setSection2Data] = useState<sanJuansection2Type>(DEFAULT_SECTION2_DATA);
  const [section3Data, setSection3Data] = useState<sanJuanSection3Type>(DEFAULT_SECTION3_DATA);
  const [section4Data, setSection4Data] = useState<sanJuansection4Type>(DEFAULT_SECTION4_DATA);
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

  const handleSection3ImageUpdate = (index: number, file: File) => {
    const preview = URL.createObjectURL(file);
    setSection3Data(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, source: preview } : img
      )
    }));
  };

  const handleSection3ImageRemove = (index: number) => {
    setSection3Data(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, source: "" } : img
      )
    }));
  };

  const handleSection4Update = (field: keyof sanJuansection4Type, value: string) => {
    setSection4Data(prev => ({
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full h-full flex flex-col items-center justify-start p-8"
    >
      {step === 'options' && (
        <motion.div
          variants={buttonVariants}
          className="flex flex-col items-center gap-4"
        >
          <Button
            size="lg"
            onClick={handleCreate}
            className="bg-blue-900 hover:bg-blue-800 text-white font-medium px-8 py-6 rounded-full"
          >
            Crear nueva página
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-blue-900 hover:bg-blue-100"
          >
            Administrar páginas
          </Button>
        </motion.div>
      )}

      {step === 'name' && (
        <motion.div
          variants={formVariants}
          className="w-full max-w-xl flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="page-name" className="text-sm font-medium text-gray-700">
              Nombre de la página
            </label>
            <input
              id="page-name"
              type="text"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ejemplo: excursion-san-juan"
            />
          </div>
          <div className="flex justify-between">
            <Button onClick={handleBack} variant="outline">
              Atrás
            </Button>
            <Button onClick={handleNext} className="bg-blue-900 hover:bg-blue-800">
              Siguiente
            </Button>
          </div>
        </motion.div>
      )}

      {step === 'preview' && (
        <motion.div
          variants={formVariants}
          className="w-full flex flex-col gap-6"
        >
          <div className="w-full flex justify-between mb-4">
            <Button onClick={handleBack} variant="outline">
              Atrás
            </Button>
            <Button className="bg-blue-900 hover:bg-blue-800">
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
            section3Data={section3Data}
            onSection3ImageUpdate={handleSection3ImageUpdate}
            onSection3ImageRemove={handleSection3ImageRemove}
            section4Data={section4Data}
            onSection4Update={handleSection4Update}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
