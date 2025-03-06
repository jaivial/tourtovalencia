/* eslint-disable react/prop-types */
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
import { 
  Check, 
  Ship, 
  Palmtree, 
  Sun, 
  Waves, 
  Umbrella, 
  Compass, 
  Anchor, 
  MapPin, 
  Mountain, 
  Cloud,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "~/components/ui/dialog";

interface EditableSanJuanSection2Props {
  width: number;
  data: sanJuansection2Type;
  onUpdate: (field: keyof sanJuansection2Type, value: string | { file?: File; preview: string } | { enabled: boolean; src: string }) => void;
}

// Predefined animation options
const animationOptions = [
  {
    id: "default",
    name: "Barco",
    src: "https://lottie.host/c75de82a-9932-4b71-b021-22934b5e5b17/QbeG97Ss7A.lottie",
    preview: "lottie",
    icon: Ship
  },
  {
    id: "beach",
    name: "Playa",
    src: "beach-icon",
    preview: "icon",
    icon: Palmtree
  },
  {
    id: "sun",
    name: "Sol",
    src: "sun-icon",
    preview: "icon",
    icon: Sun
  },
  {
    id: "waves",
    name: "Olas",
    src: "waves-icon",
    preview: "icon",
    icon: Waves
  },
  {
    id: "palm",
    name: "Palmera",
    src: "palm-icon",
    preview: "icon",
    icon: Palmtree
  },
  {
    id: "umbrella",
    name: "Sombrilla",
    src: "umbrella-icon",
    preview: "icon",
    icon: Umbrella
  },
  {
    id: "compass",
    name: "Brújula",
    src: "compass-icon",
    preview: "icon",
    icon: Compass
  },
  {
    id: "anchor",
    name: "Ancla",
    src: "anchor-icon",
    preview: "icon",
    icon: Anchor
  },
  {
    id: "map",
    name: "Mapa",
    src: "map-icon",
    preview: "icon",
    icon: MapPin
  },
  {
    id: "mountain",
    name: "Montaña",
    src: "mountain-icon",
    preview: "icon",
    icon: Mountain
  },
  {
    id: "cloud",
    name: "Nube",
    src: "cloud-icon",
    preview: "icon",
    icon: Cloud
  },
  // GIF options
  {
    id: "gif-1",
    name: "Barco GIF",
    src: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzE1djk0bXFzb253ZjhocnRkeWIzdTJiNWN5dWtjczJ1aWFlNThzZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Yw8LhqJYneW06RfgIf/giphy.gif",
    preview: "gif",
    icon: null
  },
  {
    id: "gif-2",
    name: "Playa GIF",
    src: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXFxc3h2NnNyZGM4ZnU5eWQ3cmM2Y2loMXM5N2RsNmJscGQzZzc3aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/7cVBRpwlPyIznC2sDq/giphy.gif",
    preview: "gif",
    icon: null
  },
  {
    id: "gif-3",
    name: "Palmera GIF",
    src: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDRtMXJsNW5lOHhnOGlxcnA5ZWVuZXVscnhkejRscjFyODl4cG5tcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/R0qEWj33vaHTUG3WFF/giphy.gif",
    preview: "gif",
    icon: null
  },
  {
    id: "gif-4",
    name: "Viaje GIF",
    src: "https://media.giphy.com/media/UVkQ14VTDTI26GyXVU/giphy.gif?cid=790b76112k2ebt9egpdhjk596fg5fbdn4hw6mf05hawd6r7q&ep=v1_stickers_search&rid=giphy.gif&ct=s",
    preview: "gif",
    icon: null
  },
  {
    id: "gif-5",
    name: "Maleta GIF",
    src: "https://media.giphy.com/media/LrM4uGlpOHitZ5Ogub/giphy.gif?cid=790b76112k2ebt9egpdhjk596fg5fbdn4hw6mf05hawd6r7q&ep=v1_stickers_search&rid=giphy.gif&ct=s",
    preview: "gif",
    icon: null
  },
  {
    id: "gif-6",
    name: "Avión GIF",
    src: "https://media.giphy.com/media/UQgwxFSjhbUGpoSEXL/giphy.gif?cid=ecf05e47smj5s9k5bjdzz3ta9iuw19q6w6odr4t7f9rr0lof&ep=v1_stickers_search&rid=giphy.gif&ct=s",
    preview: "gif",
    icon: null
  },
  {
    id: "gif-7",
    name: "Mapa GIF",
    src: "https://media.giphy.com/media/dAu3qBzpmXstCTimDv/giphy.gif?cid=790b7611264cotuvxju8qcgxmvcuucs1z4l6vtcjgmwx57xq&ep=v1_stickers_search&rid=giphy.gif&ct=s",
    preview: "gif",
    icon: null
  },
  {
    id: "gif-8",
    name: "Brújula GIF",
    src: "https://media.giphy.com/media/8p1WPEOeDWFCksfe18/giphy.gif?cid=790b7611264cotuvxju8qcgxmvcuucs1z4l6vtcjgmwx57xq&ep=v1_stickers_search&rid=giphy.gif&ct=s",
    preview: "gif",
    icon: null
  },
  {
    id: "gif-9",
    name: "Barco 2 GIF",
    src: "https://media.giphy.com/media/3o7WIAwEIpiH58BQYM/giphy.gif?cid=790b76113f06s4g2xvj04rxumn2574n3wc7we8hokuprqbtw&ep=v1_stickers_search&rid=giphy.gif&ct=s",
    preview: "gif",
    icon: null
  },
  {
    id: "gif-10",
    name: "Playa 2 GIF",
    src: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdm80emV4bjd6cWt2NzdjdHpxNXdnZ25mZHBndG1ucGhwemxkODVqbCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/cnPihpbzb1KM14OU3B/giphy.gif",
    preview: "gif",
    icon: null
  },
  {
    id: "gif-11",
    name: "Palmera 2 GIF",
    src: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdm80emV4bjd6cWt2NzdjdHpxNXdnZ25mZHBndG1ucGhwemxkODVqbCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/jPBeUiexbtmTXYBvBf/giphy.gif",
    preview: "gif",
    icon: null
  },
  {
    id: "gif-12",
    name: "Avión 2 GIF",
    src: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGR2ejJiYWZnaG91czhmbjBmNHVuc2FjM3ZqdWNjM2Q0Y2ZxcHVvbyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/UsBJ28yTpIvflXiBzX/giphy.gif",
    preview: "gif",
    icon: null
  },
  {
    id: "gif-13",
    name: "Maleta 2 GIF",
    src: "https://media.giphy.com/media/LI7LkDukPz467s4sOO/giphy.gif?cid=790b76110dvz2bafghous8fn0f4unsac3vjucc3d4cfqpuoo&ep=v1_stickers_search&rid=giphy.gif&ct=s",
    preview: "gif",
    icon: null
  }
];

const EditableSanJuanSection2: React.FC<EditableSanJuanSection2Props> = ({ 
  width, 
  data, 
  onUpdate 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const { handleTextUpdate, handleImageChange, handleImageRemove, handleLottieToggle, handleLottieSourceChange } = useEditableSanJuanSection2(data);
  const [showLottieControls, setShowLottieControls] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lottieSource, setLottieSource] = useState(data.lottieAnimation?.src || "https://lottie.host/c75de82a-9932-4b71-b021-22934b5e5b17/QbeG97Ss7A.lottie");
  const [isLottieEnabled, setIsLottieEnabled] = useState(data.lottieAnimation?.enabled ?? true);

  // Find the current animation index on mount
  useEffect(() => {
    const currentSrc = data.lottieAnimation?.src || "https://lottie.host/c75de82a-9932-4b71-b021-22934b5e5b17/QbeG97Ss7A.lottie";
    const index = animationOptions.findIndex(option => option.src === currentSrc);
    if (index !== -1) {
      // We found the index but don't need to use it currently
      console.log(`Found animation at index ${index}`);
    }
  }, [data.lottieAnimation?.src]);

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
    // Validate the URL
    let validatedUrl = lottieSource.trim();
    
    // Basic URL validation
    if (validatedUrl && !validatedUrl.startsWith('http')) {
      console.warn('Invalid URL format, adding https:// prefix');
      validatedUrl = `https://${validatedUrl}`;
    }
    
    console.log(`Updating lottie animation source to: ${validatedUrl}`);
    
    // Update local state
    setLottieSource(validatedUrl);
    
    // Update parent component state
    handleLottieSourceChange(validatedUrl);
    
    // Send update to parent component
    onUpdate('lottieAnimation', { 
      enabled: isLottieEnabled, 
      src: validatedUrl 
    });
    
    // Log for debugging
    console.log(`Lottie animation updated: enabled=${isLottieEnabled}, src=${validatedUrl}`);
  };

  const handleSelectAnimation = (src: string) => {
    console.log(`Selecting animation with source: ${src}`);
    
    // Validate the URL
    if (!src) {
      console.error('Empty animation source provided');
      return;
    }
    
    // Update local state
    setLottieSource(src);
    
    // Update parent component state
    handleLottieSourceChange(src);
    
    // Send update to parent component
    onUpdate('lottieAnimation', { 
      enabled: isLottieEnabled, 
      src: src 
    });
    
    // Log for debugging
    console.log(`Animation selected: enabled=${isLottieEnabled}, src=${src}`);
    
    // Close the dialog
    setDialogOpen(false);
  };

  // Get the current animation preview
  const getCurrentAnimationPreview = () => {
    const currentOption = animationOptions.find(option => option.src === lottieSource);
    if (!currentOption) return null;

    if (currentOption.preview === "lottie") {
      return (
        <DotLottieReact 
          src={currentOption.src} 
          loop 
          autoplay 
          className="w-12 h-12" 
        />
      );
    } else if (currentOption.preview === "icon" && currentOption.icon) {
      return <currentOption.icon size={32} className="text-blue-500" />;
    } else if (currentOption.preview === "gif") {
      return (
        <img 
          src={currentOption.src} 
          alt={currentOption.name} 
          className="w-12 h-12 object-contain" 
        />
      );
    }
    return null;
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
            
            <div className="flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs flex items-center gap-2"
                  >
                    {getCurrentAnimationPreview()}
                    <span>Elegir animación</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-center">Galería de animaciones</DialogTitle>
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Cerrar</span>
                    </DialogClose>
                  </DialogHeader>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-2">
                    {animationOptions.map((option) => (
                      <div 
                        key={option.id}
                        className={`
                          relative flex flex-col items-center p-2 border rounded-lg cursor-pointer
                          ${lottieSource === option.src ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                          transition-all duration-200 aspect-square
                        `}
                        onClick={() => handleSelectAnimation(option.src)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectAnimation(option.src);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Seleccionar animación ${option.name}`}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          {option.preview === "lottie" ? (
                            <DotLottieReact 
                              src={option.src} 
                              loop 
                              autoplay 
                              className="w-full h-full max-w-[60px] max-h-[60px]" 
                            />
                          ) : option.preview === "icon" ? (
                            <div className="text-blue-500">
                              {option.icon && <option.icon size={40} />}
                            </div>
                          ) : option.preview === "gif" ? (
                            <img 
                              src={option.src} 
                              alt={option.name} 
                              className="w-full h-full object-contain max-w-[60px] max-h-[60px]" 
                            />
                          ) : null}
                        </div>
                        
                        {lottieSource === option.src && (
                          <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowLottieControls(!showLottieControls);
                }}
                className="text-xs"
              >
                {showLottieControls ? "Ocultar URL" : "URL personalizada"}
              </Button>
            </div>
            
            {/* Custom URL Input */}
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
              {lottieSource.endsWith(".lottie") ? (
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
              ) : lottieSource.includes("giphy.gif") || lottieSource.includes("giphy.com") ? (
                <img 
                  src={lottieSource} 
                  alt="Animation" 
                  className={`
                    -translate-y-[0px] mb-0
                    ${width <= 450 ? "w-[200px]" : "w-[250px]"}
                    object-contain
                  `} 
                />
              ) : (
                <div className="text-blue-500 -translate-y-[50px] -mb-16">
                  {lottieSource === "beach-icon" && <Palmtree size={width <= 450 ? 100 : 150} />}
                  {lottieSource === "sun-icon" && <Sun size={width <= 450 ? 100 : 150} />}
                  {lottieSource === "waves-icon" && <Waves size={width <= 450 ? 100 : 150} />}
                  {lottieSource === "palm-icon" && <Palmtree size={width <= 450 ? 100 : 150} />}
                  {lottieSource === "umbrella-icon" && <Umbrella size={width <= 450 ? 100 : 150} />}
                  {lottieSource === "compass-icon" && <Compass size={width <= 450 ? 100 : 150} />}
                  {lottieSource === "anchor-icon" && <Anchor size={width <= 450 ? 100 : 150} />}
                  {lottieSource === "map-icon" && <MapPin size={width <= 450 ? 100 : 150} />}
                  {lottieSource === "mountain-icon" && <Mountain size={width <= 450 ? 100 : 150} />}
                  {lottieSource === "cloud-icon" && <Cloud size={width <= 450 ? 100 : 150} />}
                </div>
              )}
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
