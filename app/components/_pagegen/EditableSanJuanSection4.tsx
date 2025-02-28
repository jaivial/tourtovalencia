import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { sanJuansection4Type } from "~/data/data";
import EditableText from "./EditableText";
import { useEditableSanJuanSection4 } from "./EditableSanJuanSection4.hooks";
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

interface EditableSanJuanSection4Props {
  width: number;
  data: sanJuansection4Type;
  onUpdate: (field: keyof sanJuansection4Type, value: string | { enabled: boolean; src: string }) => void;
}

// Predefined animation options
const animationOptions = [
  {
    id: "default",
    name: "Barco",
    src: "https://lottie.host/f8570958-3acf-4c42-8ae6-2ad50fe220c7/N8q8bzQLK3.lottie",
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
  }
];

const EditableSanJuanSection4: React.FC<EditableSanJuanSection4Props> = ({ 
  width,
  data,
  onUpdate 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const { sectionData, handleTextUpdate } = useEditableSanJuanSection4(data);
  const [showLottieControls, setShowLottieControls] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lottieSource, setLottieSource] = useState(data.lottieAnimation?.src || "https://lottie.host/f8570958-3acf-4c42-8ae6-2ad50fe220c7/N8q8bzQLK3.lottie");
  const [isLottieEnabled, setIsLottieEnabled] = useState(data.lottieAnimation?.enabled ?? true);

  // Update local state when props change
  useEffect(() => {
    setLottieSource(data.lottieAnimation?.src || "https://lottie.host/f8570958-3acf-4c42-8ae6-2ad50fe220c7/N8q8bzQLK3.lottie");
    setIsLottieEnabled(data.lottieAnimation?.enabled ?? true);
  }, [data.lottieAnimation?.src, data.lottieAnimation?.enabled]);

  const commonH3Styles = `
    transition-all duration-500 ease-in-out 
    text-blue-950 font-sans text-center
    leading-normal hover:text-blue-900
  `;

  const getResponsiveTextSize = (small: string, semismall: string, medium: string, semilarge: string, large: string) => 
    `${width <= 350 ? small : width <= 450 ? semismall : width <= 580 ? medium : width <= 768 ? semilarge : large}`;

  const handleLottieToggleChange = (checked: boolean) => {
    setIsLottieEnabled(checked);
    onUpdate('lottieAnimation', { 
      enabled: checked, 
      src: lottieSource 
    });
  };

  const handleLottieSourceSubmit = () => {
    onUpdate('lottieAnimation', { 
      enabled: isLottieEnabled, 
      src: lottieSource 
    });
  };

  const handleSelectAnimation = (src: string) => {
    setLottieSource(src);
    onUpdate('lottieAnimation', { 
      enabled: isLottieEnabled, 
      src: src 
    });
    setDialogOpen(false);
  };

  // Function to render the appropriate animation based on the source
  const renderAnimation = () => {
    // Check if it's a GIF animation
    if (lottieSource.includes("giphy.gif")) {
      return (
        <img 
          src={lottieSource} 
          alt="Animation" 
          className={`
            ${width <= 500 ? "w-[300px]" : "w-[400px]"}
            object-contain
          `} 
        />
      );
    }
    // Check if it's a Lottie animation or an icon
    else if (lottieSource === "https://lottie.host/f8570958-3acf-4c42-8ae6-2ad50fe220c7/N8q8bzQLK3.lottie") {
      return (
        <DotLottieReact 
          src={lottieSource} 
          loop 
          autoplay 
          className={`${width <= 500 ? "w-[400px]" : "w-[600px]"}`} 
        />
      );
    } else {
      // Render the appropriate icon based on the source identifier
      const iconSize = width <= 450 ? 100 : 150;
      const iconClassName = "text-blue-500";
      
      switch (lottieSource) {
        case "beach-icon":
          return <Palmtree size={iconSize} className={iconClassName} />;
        case "sun-icon":
          return <Sun size={iconSize} className={iconClassName} />;
        case "waves-icon":
          return <Waves size={iconSize} className={iconClassName} />;
        case "palm-icon":
          return <Palmtree size={iconSize} className={iconClassName} />;
        case "umbrella-icon":
          return <Umbrella size={iconSize} className={iconClassName} />;
        case "compass-icon":
          return <Compass size={iconSize} className={iconClassName} />;
        case "anchor-icon":
          return <Anchor size={iconSize} className={iconClassName} />;
        case "map-icon":
          return <MapPin size={iconSize} className={iconClassName} />;
        case "mountain-icon":
          return <Mountain size={iconSize} className={iconClassName} />;
        case "cloud-icon":
          return <Cloud size={iconSize} className={iconClassName} />;
        default:
          // If it's not a recognized icon identifier, try to render it as a Lottie animation
          return (
            <DotLottieReact 
              src={lottieSource} 
              loop 
              autoplay 
              className={`${width <= 500 ? "w-[400px]" : "w-[600px]"}`} 
            />
          );
      }
    }
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
    <motion.div 
      ref={ref}
      animate={isInView ? 
        { opacity: 1, y: 0 } : 
        { opacity: 0, y: 50 }
      }
      transition={{ duration: 0.8 }}
      className={`
        w-[95%] max-w-[1280px] flex flex-col flex-wrap-reverse 
        items-center justify-center mt-4 mb-16 mx-auto relative z-0 
        ${width <= 1280 ? "gap-0" : "gap-10"}
      `}
    >
      <motion.div 
        animate={isInView ? 
          { opacity: 1, scale: 1 } : 
          { opacity: 0, scale: 0.9 }
        }
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`
          w-full max-w-[620px] min-h-[600px] 
          flex flex-col justify-center items-center 
          p-6 gap-8 -translate-y-[50px]
        `}
      >
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
        {isLottieEnabled && renderAnimation()}

        <motion.div 
          whileHover={{ scale: 1.02 }}
          animate={isInView ? 
            { opacity: 1, x: 0 } : 
            { opacity: 0, x: -20 }
          }
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`
            ${commonH3Styles}
            font-bold leading-[1.6]
            ${getResponsiveTextSize(
              "text-[1.7rem]", 
              "text-[2.1rem]", 
              "text-[2.5rem]", 
              "text-[2.9rem]", 
              "text-[3.3rem]"
            )}
          `}
        >
          <EditableText
            value={sectionData.firstH3}
            onUpdate={(value) => {
              handleTextUpdate("firstH3", value);
              onUpdate("firstH3", value);
            }}
            className="w-full text-blue-950"
          />
          <br />
          <span className="font-medium">
            <EditableText
              value={sectionData.secondH3}
              onUpdate={(value) => {
                handleTextUpdate("secondH3", value);
                onUpdate("secondH3", value);
              }}
              className="w-full text-blue-950"
            />
          </span>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          animate={isInView ? 
            { opacity: 1, x: 0 } : 
            { opacity: 0, x: 20 }
          }
          transition={{ duration: 0.6, delay: 0.6 }}
          className={`
            ${commonH3Styles}
            font-medium
            ${getResponsiveTextSize(
              "text-[1.1rem]", 
              "text-[1.4rem]",
              "text-[1.7rem]",
              "text-[2rem]",
              "text-[2.3rem]"
            )}
          `}
        >
          <EditableText
            value={sectionData.thirdH3}
            onUpdate={(value) => {
              handleTextUpdate("thirdH3", value);
              onUpdate("thirdH3", value);
            }}
            className="w-full text-blue-950"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EditableSanJuanSection4;
