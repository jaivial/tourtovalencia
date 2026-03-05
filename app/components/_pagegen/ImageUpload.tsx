import { Button } from "../ui/button";
import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SUPPORTED_IMAGE_ACCEPT = "image/*,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.tif,.tiff,.svg,.jfif";

type ImageUploadProps = {
  imageUrl?: string | null;
  className?: string;
  onImageChange: (file: File) => void;
  onImageRemove: () => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  className = "",
  onImageChange,
  onImageRemove
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const hasImage = typeof imageUrl === "string" && imageUrl.trim().length > 0;

  // Debug logs
  console.log('ImageUpload: Component rendered with imageUrl:', 
    imageUrl ? (imageUrl.length > 30 ? imageUrl.substring(0, 30) + '...' : imageUrl) : 'none');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsTouchDevice(window.matchMedia('(hover: none), (pointer: coarse)').matches || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    console.log('ImageUpload: useEffect - imageUrl:', 
      imageUrl ? (imageUrl.length > 30 ? imageUrl.substring(0, 30) + '...' : imageUrl) : 'none');
  }, [imageUrl]);

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    if (target.files?.[0]) {
      const file = target.files[0];
      console.log('ImageUpload: File selected:', file.name, file.type, file.size);
      onImageChange(file);
    }

    target.value = '';
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ImageUpload: Removing image');
    onImageRemove();
  };

  return (
    <div className={`relative w-full h-full group ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_IMAGE_ACCEPT}
        className="absolute h-0 w-0 opacity-0 pointer-events-none"
        onChange={handleFileChange}
      />

      {hasImage ? (
        <img 
          src={imageUrl}
          alt="Section content"
          className="w-full h-full object-cover rounded-2xl transition-transform duration-700"
        />
      ) : (
        <div className="w-full h-full rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/60 flex items-center justify-center px-4 text-center text-sm text-blue-700">
          Sin imagen
        </div>
      )}
      
      {/* Overlay with buttons */}
      <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 rounded-2xl flex items-center justify-center z-10 ${
        isTouchDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
      }`}>
        <div className="flex gap-2 pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-white/90 hover:bg-white"
            onClick={handleUploadClick}
            data-upload-control="true"
          >
            <Upload className="h-4 w-4" />
          </Button>
          {hasImage && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-white/90 hover:bg-white"
              onClick={handleRemoveClick}
              data-upload-control="true"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
