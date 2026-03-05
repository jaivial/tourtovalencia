import { useState } from "react";
import PageTemplate from "~/components/_pagegen/PageTemplate";
import { InfoRequestContactType, sanJuanSection5Type } from "~/data/data";
import { countries } from "~/data/countries";

export default function PageCreationRoute() {
  // State declarations would go here
  const [status, setStatus] = useState<"active" | "upcoming">("active");
  const [pageName, setPageName] = useState("");
  const [price, setPrice] = useState(0);
  const [hasPrice, setHasPrice] = useState(true);
  const [infoRequestContact, setInfoRequestContact] = useState<InfoRequestContactType>({
    countryCode: "ES",
    dialCode: "+34",
    phoneNumber: "",
    message: "Hola, me gustaría pedir información sobre este servicio.",
  });
  const [section5Data, setSection5Data] = useState<sanJuanSection5Type>({
    firstH3: "¿Qué haremos en San Juan?",
    secondH3: "Nos bañaremos en las aguas cristalinas de la playa de San Juan",
    thirdH3: "Disfrutaremos de un día de playa y relax",
    fourthH3: "Podremos practicar snorkel y ver los peces",
    fifthH3: "Tendremos tiempo libre para explorar el pueblo",
    image: null
  });
  
  // Other state declarations and handlers would be here
  const handleStatusChange = (checked: boolean) => {
    setStatus(checked ? "active" : "upcoming");
  };
  
  const handlePriceChange = (value: number) => {
    setPrice(Number.isFinite(value) && value >= 0 ? value : 0);
  };

  const handleInfoRequestCountryChange = (countryCode: string) => {
    const country = countries.find((item) => item.code === countryCode);
    setInfoRequestContact((prev) => ({
      ...prev,
      countryCode,
      dialCode: country?.dialCode || "+34",
    }));
  };
  
  // Add section5 image update handler
  const handleSection5ImageUpdate = async (file: File) => {
    try {
      console.log('Processing section5 image update:', file.name, file.type, file.size);
      
      // Convert the file to base64 for preview
      const reader = new FileReader();
      
      // Set up the onload handler before calling readAsDataURL
      reader.onload = () => {
        const base64 = reader.result as string;
        console.log('Base64 image created, length:', base64.length);
        
        // Update the section5 data with the image
        setSection5Data(prev => {
          console.log('Updating section5Data with new image');
          return {
            ...prev,
            image: base64
          };
        });
      };
      
      // Start reading the file
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error updating section5 image:', error);
    }
  };

  // Add section5 image remove handler
  const handleSection5ImageRemove = () => {
    try {
      console.log('Processing section5 image removal');
      
      setSection5Data(prev => ({
        ...prev,
        image: null
      }));
    } catch (error) {
      console.error('Error removing section5 image:', error);
    }
  };
  
  // Placeholder handlers for other required props
  const handleSection5Update = (field: keyof sanJuanSection5Type, value: string | { enabled: boolean; src: string } | null) => {
    setSection5Data(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Mock data and handlers for other required props
  const mockHandlers = {
    handleIndexSection5Update: () => {},
    handleSection1Update: () => {},
    handleSection2Update: () => {},
    handleSection3ImageUpdate: () => {},
    handleSection3ImageRemove: () => {},
    handleSection4Update: () => {},
    handleSection6Update: () => {},
    handleTimelineUpdate: () => {}
  };

  return (
    <div className="w-full">
      <PageTemplate
        status={status}
        onStatusChange={handleStatusChange}
        indexSection5Data={{firstH3: "", secondH3: ""}}
        onIndexSection5Update={mockHandlers.handleIndexSection5Update}
        section1Data={{firstH3: "", firstSquareH3: "", firstSquareP: "", secondSquareH3: "", secondSquareP: "", thirdSquareH3: "", thirdSquareP: "", button: "", backgroundImage: {preview: ""}}}
        onSection1Update={mockHandlers.handleSection1Update}
        section2Data={{firstH3: "", secondH3: "", thirdH3: "", sectionImage: {preview: ""}}}
        onSection2Update={mockHandlers.handleSection2Update}
        section3Data={{images: []}}
        onSection3ImageUpdate={mockHandlers.handleSection3ImageUpdate}
        onSection3ImageRemove={mockHandlers.handleSection3ImageRemove}
        section4Data={{firstH3: "", secondH3: "", thirdH3: ""}}
        onSection4Update={mockHandlers.handleSection4Update}
        section5Data={section5Data}
        onSection5Update={handleSection5Update}
        onSection5ImageUpdate={handleSection5ImageUpdate}
        onSection5ImageRemove={handleSection5ImageRemove}
        section6Data={{cardTitle: "", cardDescription: "", firstH4: "", list: [], secondH4: "", secondH4span: "", button: ""}}
        onSection6Update={mockHandlers.handleSection6Update}
        timelineData={{title: "", subtitle: "", steps: []}}
        onTimelineUpdate={mockHandlers.handleTimelineUpdate}
        pageName={pageName}
        price={price}
        hasPrice={hasPrice}
        infoRequestContact={infoRequestContact}
        onPriceChange={handlePriceChange}
        onHasPriceChange={setHasPrice}
        onInfoRequestCountryChange={handleInfoRequestCountryChange}
        onInfoRequestPhoneChange={(phoneNumber) =>
          setInfoRequestContact((prev) => ({
            ...prev,
            phoneNumber,
          }))
        }
        onInfoRequestMessageChange={(message) =>
          setInfoRequestContact((prev) => ({
            ...prev,
            message,
          }))
        }
      />
    </div>
  );
} 