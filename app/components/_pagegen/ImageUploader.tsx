import { Button } from "../ui/button";
import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SUPPORTED_IMAGE_ACCEPT = "image/*,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.tif,.tiff,.svg,.jfif";

type ImageUploaderProps = {
  currentImage?: string | null;
  onImageChange: (file: File) => void;
  onImageRemove?: () => void;
  isHovering?: boolean;
  className?: string;
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageChange,
  onImageRemove,
  isHovering = false,
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const hasImage = typeof currentImage === "string" && currentImage.trim().length > 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsTouchDevice(window.matchMedia('(hover: none), (pointer: coarse)').matches || navigator.maxTouchPoints > 0);
  }, []);

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    if (target.files?.[0]) {
      onImageChange(target.files[0]);
    }

    target.value = '';
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_IMAGE_ACCEPT}
        className="absolute h-0 w-0 opacity-0 pointer-events-none"
        onChange={handleFileChange}
      />

      {/* Image display */}
      {hasImage ? (
        <img 
          src={currentImage}
          alt="Tour"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full border-2 border-dashed border-blue-300 bg-blue-50/60 flex items-center justify-center text-sm text-blue-700 text-center px-4">
          Sin imagen
        </div>
      )}
      
      {/* Overlay with camera icon that appears on hover */}
      <div 
        className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
          isTouchDevice || isHovering ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-white/90 hover:bg-white text-blue-600"
            onClick={handleUploadClick}
            aria-label="Upload image"
            data-upload-control="true"
          >
            <Camera className="h-6 w-6" />
          </Button>
          {hasImage && onImageRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/90 hover:bg-white text-red-600"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onImageRemove();
              }}
              aria-label="Remove image"
              data-upload-control="true"
            >
              <X className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader; 