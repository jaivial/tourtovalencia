import { useState } from "react";
import { 
  IndexSection5Type, 
  sanJuanSection1Type, 
  sanJuanSection3Type, 
  sanJuansection2Type, 
  sanJuansection4Type, 
  sanJuanSection5Type, 
  SanJuanSection6Type 
} from "~/data/data";
import { TimelineDataType } from "~/components/_index/EditableTimelineFeature";

// Default data
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

const DEFAULT_SECTION3_DATA: sanJuanSection3Type = {
  images: Array(8).fill({ source: "", alt: "Gallery image" })
};

const DEFAULT_SECTION4_DATA: sanJuansection4Type = {
  firstH3: "¿Qué incluye la excursión en barco en San Juan?",
  secondH3: "Excursión de 6 horas",
  thirdH3: "Salida desde Valencia"
};

const DEFAULT_SECTION5_DATA: sanJuanSection5Type = {
  firstH3: "¿Qué haremos en San Juan?",
  secondH3: "Nos bañaremos en las aguas cristalinas de la playa de San Juan",
  thirdH3: "Disfrutaremos de un día de playa y relax",
  fourthH3: "Podremos practicar snorkel y ver los peces",
  fifthH3: "Tendremos tiempo libre para explorar el pueblo"
};

const DEFAULT_SECTION6_DATA: SanJuanSection6Type = {
  cardTitle: "Información importante",
  cardDescription: "Todo lo que necesitas saber sobre la excursión",
  firstH4: "Qué incluye",
  list: [
    { li: "Transporte en barco", index: 0 },
    { li: "Guía experto", index: 1 },
    { li: "Equipo de snorkel", index: 2 },
    { li: "Seguro de viaje", index: 3 }
  ],
  secondH4: "Precio",
  secondH4span: "50€ por persona",
  button: "Reservar ahora"
};

const DEFAULT_INDEX_SECTION5_DATA: IndexSection5Type = {
  firstH3: "",
  secondH3: ""
};

const DEFAULT_TIMELINE_DATA: TimelineDataType = {
  title: "Cronología del Viaje",
  subtitle: "Descubre el itinerario paso a paso",
  steps: [
    {
      title: "Salida",
      description: "Punto de encuentro y salida desde Valencia"
    },
    {
      title: "Llegada",
      description: "Llegada al destino y bienvenida"
    }
  ]
};

export const usePageGenerator = () => {
  const [step, setStep] = useState<'name' | 'template'>('name');
  const [pageName, setPageName] = useState('');
  const [status, setStatus] = useState<'active' | 'upcoming'>('active');
  
  // Section states
  const [section1Data, setSection1Data] = useState<sanJuanSection1Type>(DEFAULT_SECTION1_DATA);
  const [section2Data, setSection2Data] = useState<sanJuansection2Type>(DEFAULT_SECTION2_DATA);
  const [section3Data, setSection3Data] = useState<sanJuanSection3Type>(DEFAULT_SECTION3_DATA);
  const [section4Data, setSection4Data] = useState<sanJuansection4Type>(DEFAULT_SECTION4_DATA);
  const [section5Data, setSection5Data] = useState<sanJuanSection5Type>(DEFAULT_SECTION5_DATA);
  const [section6Data, setSection6Data] = useState<SanJuanSection6Type>(DEFAULT_SECTION6_DATA);
  const [indexSection5Data, setIndexSection5Data] = useState<IndexSection5Type>(DEFAULT_INDEX_SECTION5_DATA);
  const [timelineData, setTimelineData] = useState<TimelineDataType>(DEFAULT_TIMELINE_DATA);

  // Section 1 handlers
  const handleSection1Update = (field: keyof sanJuanSection1Type, value: string | { file?: File; preview: string }) => {
    setSection1Data(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSection1ImageUpdate = (file: File) => {
    const preview = URL.createObjectURL(file);
    setSection1Data(prev => ({
      ...prev,
      backgroundImage: { file, preview }
    }));
  };

  const handleSection1ImageRemove = () => {
    setSection1Data(prev => ({
      ...prev,
      backgroundImage: { preview: '/olgaphoto3.jpeg' }
    }));
  };

  // Section 2 handlers
  const handleSection2Update = (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string }) => {
    setSection2Data(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSection2ImageUpdate = (file: File) => {
    const preview = URL.createObjectURL(file);
    setSection2Data(prev => ({
      ...prev,
      sectionImage: { file, preview }
    }));
  };

  const handleSection2ImageRemove = () => {
    setSection2Data(prev => ({
      ...prev,
      sectionImage: { preview: '/olgaphoto3.jpeg' }
    }));
  };

  // Section 3 handlers
  const handleSection3ImageUpdate = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setSection3Data(prev => ({
        ...prev,
        images: prev.images.map((img, i) => 
          i === index ? { source: base64String, alt: "Gallery image" } : img
        )
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSection3ImageRemove = (index: number) => {
    setSection3Data(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { source: "", alt: "Gallery image" } : img
      )
    }));
  };

  // Section 4 handler
  const handleSection4Update = (field: keyof sanJuansection4Type, value: string) => {
    setSection4Data(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Section 5 handler
  const handleSection5Update = (field: keyof sanJuanSection5Type, value: string) => {
    setSection5Data(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Section 6 handler
  const handleSection6Update = (field: keyof SanJuanSection6Type, value: string) => {
    if (field === "list") {
      // Handle list updates separately since it's an array
      setSection6Data(prev => ({
        ...prev,
        list: JSON.parse(value)
      }));
    } else {
      setSection6Data(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Index Section 5 handler
  const handleIndexSection5Update = (field: keyof IndexSection5Type, value: string) => {
    setIndexSection5Data(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Timeline handler
  const handleTimelineUpdate = (field: keyof TimelineDataType, value: string | Array<{title: string, description: string}>) => {
    setTimelineData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Status handler
  const handleStatusChange = (checked: boolean) => {
    setStatus(checked ? 'active' : 'upcoming');
  };

  // Navigation handlers
  const handleNext = () => {
    if (step === 'name') {
      if (!pageName.trim()) {
        return;
      }
      setStep('template');
    }
  };

  const handleBack = () => {
    if (step === 'template') {
      setStep('name');
    }
  };

  return {
    // States
    step,
    pageName,
    status,
    section1Data,
    section2Data,
    section3Data,
    section4Data,
    section5Data,
    section6Data,
    indexSection5Data,
    timelineData,

    // Setters
    setPageName,

    // Handlers
    handleNext,
    handleBack,
    handleSection1Update,
    handleSection1ImageUpdate,
    handleSection1ImageRemove,
    handleSection2Update,
    handleSection2ImageUpdate,
    handleSection2ImageRemove,
    handleSection3ImageUpdate,
    handleSection3ImageRemove,
    handleSection4Update,
    handleSection5Update,
    handleSection6Update,
    handleIndexSection5Update,
    handleTimelineUpdate,
    handleStatusChange,
  };
};
