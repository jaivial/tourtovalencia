import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { sanJuansection2Type } from "~/data/data";
import EditableText from "./EditableText";
import ImageUpload from "./ImageUpload";
import { useEditableSanJuanSection2 } from "./EditableSanJuanSection2.hooks";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Input } from "@heroui/input";
import { Button } from "~/components/ui/button";

interface EditableSanJuanSection2Props {
  width: number;
  height: number;
  data: sanJuansection2Type;
  onUpdate: (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string } | { enabled: boolean; src: string }) => void;
}

const EditableSanJuanSection2: React.FC<EditableSanJuanSection2Props> = ({ 
  width, 
  height, 
  data, 
  onUpdate 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const { handleTextUpdate, handleImageChange, handleImageRemove, handleLottieToggle, handleLottieSourceChange } = useEditableSanJuanSection2(data);
  const [showLottieControls, setShowLottieControls] = useState(false);
  const [lottieSource, setLottieSource] = useState(data.lottieAnimation?.src || "https://lottie.host/c75de82a-9932-4b71-b021-22934b5e5b17/QbeG97Ss7A.lottie");
  const [isLottieEnabled, setIsLottieEnabled] = useState(data.lottieAnimation?.enabled ?? true);

  // Update local state when props change
  useEffect(() => {
    setLottieSource(data.lottieAnimation?.src || "https://lottie.host/c75de82a-9932-4b71-b021-22934b5e5b17/QbeG97Ss7A.lottie");
    setIsLottieEnabled(data.lottieAnimation?.enabled ?? true);
  }, [data.lottieAnimation?.src, data.lottieAnimation?.enabled]);

  const commonH3Styles = `
    transition-all duration-500 ease-in-out 
    text-blue-950 font-sans text-center
    leading-normal hover:text-blue-900
  `;

  const getResponsiveTextSize = (small: string, medium: string, large: string) => 
    `${width <= 350 ? small : width <= 450 ? medium : large}`;

  const handleLottieToggleChange = (checked: boolean) => {
    setIsLottieEnabled(checked);
    handleLottieToggle(checked);
    onUpdate('lottieAnimation', { 
      enabled: checked, 
      src: lottieSource 
    });
  };

  const handleLottieSourceSubmit = () => {
    handleLottieSourceChange(lottieSource);
    onUpdate('lottieAnimation', { 
      enabled: isLottieEnabled, 
      src: lottieSource 
    });
  };

  return (
    <div ref={ref} className="w-full overflow-x-hidden">
      <motion.div
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        initial={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className={`
          w-[95%] max-w-[1280px] flex flex-row flex-wrap-reverse 
          items-center justify-center -mt-24 mb-16 mx-auto 
          relative z-[1] ${width <= 1280 ? "gap-0" : "gap-10"}
        `}
      >
        {/* Left Content Section */}
        <motion.div
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          initial={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`
            w-full max-w-[620px] min-h-[300px] 
            flex flex-col justify-center items-center gap-6 
            ${width <= 1280 ? "p-4 mt-16" : "p-6 mt-28"} 
          `}
        >
      
          <motion.div 
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }} 
            initial={{ opacity: 0, scale: 0.9 }} 
            transition={{ duration: 0.5, delay: 0.3 }} 
            className="w-full flex justify-center"
          >
            <div className="w-[800px] h-[300px] relative rounded-lg overflow-hidden">
              <ImageUpload 
                imageUrl={data.sectionImage?.preview || ""} 
                onImageChange={(file) => {
                  handleImageChange(file);
                  const preview = URL.createObjectURL(file);
                  onUpdate('sectionImage', { file, preview });
                }}
                onImageRemove={() => {
                  handleImageRemove();
                  onUpdate("sectionImage", { preview: "" });
                }} 
                className="w-full h-full object-cover" 
              />
            </div>
          </motion.div>

          {/* Lottie Animation Controls */}
          <div className="w-full flex flex-col items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Label htmlFor="lottie-toggle" className="text-sm font-medium text-gray-700">
                Mostrar animación
              </Label>
              <Switch 
                id="lottie-toggle" 
                checked={isLottieEnabled} 
                onCheckedChange={handleLottieToggleChange} 
              />
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowLottieControls(!showLottieControls)}
              className="text-xs"
            >
              {showLottieControls ? "Ocultar opciones" : "Cambiar animación"}
            </Button>
            
            {showLottieControls && (
              <div className="w-full flex flex-col gap-2 mt-2">
                <Label htmlFor="lottie-source" className="text-xs font-medium text-gray-700">
                  URL de la animación (Lottie o GIF)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="lottie-source"
                    value={lottieSource}
                    onChange={(e) => setLottieSource(e.target.value)}
                    placeholder="URL de la animación"
                    className="text-xs"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleLottieSourceSubmit}
                    className="text-xs"
                  >
                    Aplicar
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Introduce la URL de una animación Lottie o GIF para reemplazar la actual.
                </p>
              </div>
            )}
          </div>

          {/* Lottie Animation Display */}
          {isLottieEnabled && (
            <motion.div 
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }} 
              initial={{ opacity: 0, scale: 0.9 }} 
              transition={{ duration: 0.5, delay: 0.3 }} 
              className="w-full flex justify-center"
            >
              <DotLottieReact 
                key={`lottie-${lottieSource}-${isLottieEnabled}`}
                src={lottieSource} 
                loop 
                autoplay 
                className={`
                  -translate-y-[50px] -mb-16
                  ${width <= 450 ? "w-[300px]" : "w-[400px]"}
                `} 
              />
            </motion.div>
          )}

          {[
            { text: data.firstH3, key: "firstH3" },
            { text: data.secondH3, key: "secondH3" },
            { text: data.thirdH3, key: "thirdH3" },
          ].map(({ text, key }, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{
                duration: 0.5,
                delay: 0.4 + index * 0.1,
              }}
              className={`
                ${commonH3Styles}
                font-medium w-full -translate-y-[100px] 
                ${getResponsiveTextSize("text-[1.3rem]", "text-[1.4rem]", "text-[1.5rem]")}
              `}
            >
              <EditableText 
                value={text} 
                onUpdate={(newText) => {
                  handleTextUpdate(key as keyof sanJuansection2Type, newText);
                  onUpdate(key as keyof sanJuansection2Type, newText);
                }} 
                className={commonH3Styles} 
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EditableSanJuanSection2;
