import { motion } from "framer-motion";
import { Link } from "@remix-run/react";
import EditableText from "~/components/_pagegen/EditableText";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useState } from "react";
import { ImageUploader } from "~/components/_pagegen/ImageUploader";

export type EditableCardDataType = {
  title: string;
  duration: string;
  description: string;
  additionalInfo?: string;
  quote?: string;
  image: {
    preview: string;
    file?: File;
  };
};

type EditableCardProps = {
  width: number;
  data: EditableCardDataType;
  price: number;
  status: "active" | "upcoming";
  onUpdate: (field: keyof EditableCardDataType, value: string | { file?: File; preview: string }) => void;
  isEditMode?: boolean;
};

const EditableCard: React.FC<EditableCardProps> = ({ 
  width, 
  data, 
  price, 
  status,
  onUpdate,
  isEditMode = false
}) => {
  const { state } = useLanguageContext();
  const language = state.currentLanguage === "English" ? "en" : "es";
  const perPersonText = language === "en" ? "per person" : "por persona";
  const viewDetailsText = language === "en" ? "View Details" : "Ver Detalles";
  const bookNowText = language === "en" ? "Book Now" : "Reservar Ahora";
  const comingSoonText = language === "en" ? "Coming Soon" : "Próximamente";
  
  const [isHovering, setIsHovering] = useState(false);

  const handleTextUpdate = (field: keyof EditableCardDataType) => (value: string) => {
    onUpdate(field, value);
  };

  const handleImageUpdate = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      onUpdate('image', { file, preview });
    };
    reader.readAsDataURL(file);
  };

  // Define button styles to prevent underlines
  const linkButtonStyle = {
    textDecoration: 'none'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={`
        relative rounded-xl overflow-hidden shadow-lg bg-white h-[550px] flex flex-col
        transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2
        ${status === "upcoming" ? "overflow-hidden" : ""}
      `}
    >
      {/* Tour Image */}
      <div 
        className="h-56 overflow-hidden relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isEditMode ? (
          <ImageUploader
            currentImage={data.image.preview}
            onImageChange={handleImageUpdate}
            isHovering={isHovering}
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={data.image.preview} 
            alt={data.title} 
            className={`w-full h-full object-cover transition-transform duration-500 hover:scale-110 ${status === "upcoming" ? "grayscale" : ""}`}
          />
        )}
      </div>

      {/* Tour Content */}
      <div className="p-6 flex flex-col flex-grow">
        {isEditMode ? (
          <EditableText
            value={data.title}
            onUpdate={handleTextUpdate('title')}
            placeholder="Título del tour"
            className="text-2xl font-bold text-blue-900 mb-3"
          />
        ) : (
          <h3 className="text-2xl font-bold text-blue-900 mb-3">{data.title}</h3>
        )}
        
        <div className="flex items-center mb-4 text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isEditMode ? (
            <EditableText
              value={data.duration}
              onUpdate={handleTextUpdate('duration')}
              placeholder="Duración"
              className="text-sm"
            />
          ) : (
            <p className="text-sm">{data.duration}</p>
          )}
        </div>
        
        {data.quote && (
          isEditMode ? (
            <EditableText
              value={data.quote}
              onUpdate={handleTextUpdate('quote')}
              placeholder="Cita o frase destacada"
              className="text-gray-700 text-sm mb-3 italic"
            />
          ) : (
            <p className="text-gray-700 text-sm mb-3 italic">&ldquo;{data.quote}&rdquo;</p>
          )
        )}
        
        {isEditMode ? (
          <EditableText
            value={data.description}
            onUpdate={handleTextUpdate('description')}
            placeholder="Descripción del tour"
            className="text-gray-600 text-sm mb-4 line-clamp-3"
          />
        ) : (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{data.description}</p>
        )}
        
        {data.additionalInfo && (
          isEditMode ? (
            <EditableText
              value={data.additionalInfo}
              onUpdate={handleTextUpdate('additionalInfo')}
              placeholder="Información adicional"
              className="text-gray-700 text-sm mb-3 font-medium"
            />
          ) : (
            <p className="text-gray-700 text-sm mb-3 font-medium">{data.additionalInfo}</p>
          )
        )}
        
        <div className="mt-auto">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-center bg-blue-50 py-3 px-4 rounded-lg">
              <span className="text-2xl font-bold text-blue-800">{price.toFixed(2)}€</span>
              <span className="text-sm text-blue-600 ml-1">{perPersonText}</span>
            </div>
            
            {!isEditMode && (
              <>
                {/* View More Button */}
                <div className="w-full">
                  <Link 
                    to="#"
                    className="block w-full py-3 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center font-medium"
                    style={linkButtonStyle}
                  >
                    <span className="pointer-events-none">{viewDetailsText}</span>
                  </Link>
                </div>
                
                {status === "active" ? (
                  <div className="w-full">
                    <Link 
                      to="#"
                      className="block w-full py-3 bg-blue-600 text-white hover:text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                      style={linkButtonStyle}
                    >
                      <span className="pointer-events-none text-white hover:text-white">{bookNowText}</span>
                    </Link>
                  </div>
                ) : (
                  <span className="w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed text-center font-medium">
                    {comingSoonText}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for upcoming tours */}
      {status === "upcoming" && !isEditMode && (
        <div className="absolute top-0 right-0 m-4">
          <div className="bg-blue-600/90 px-4 py-2 rounded-lg text-center shadow-md">
            <p className="text-sm font-bold text-white">{comingSoonText}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EditableCard; 