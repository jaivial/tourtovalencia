import { Button } from "../ui/button";
import { Camera } from "lucide-react";

type ImageUploaderProps = {
  currentImage: string;
  onImageChange: (file: File) => void;
  isHovering?: boolean;
  className?: string;
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageChange,
  isHovering = false,
  className = ""
}) => {
  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) {
        const file = target.files[0];
        onImageChange(file);
      }
    };
    input.click();
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Image display */}
      <img 
        src={currentImage || '/plazareina2.jpg'}
        alt="Tour"
        className="w-full h-full object-cover"
      />
      
      {/* Overlay with camera icon that appears on hover */}
      <div 
        className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-white/90 hover:bg-white text-blue-600"
          onClick={handleUploadClick}
          aria-label="Upload image"
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default ImageUploader; 