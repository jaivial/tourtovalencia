import { Button } from "../ui/button";
import { Upload, X } from "lucide-react";

type ImageUploadProps = {
  imageUrl: string;
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
        console.log('ImageUpload: File selected:', file.name, file.type, file.size);
        onImageChange(file);
      }
    };
    input.click();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ImageUpload: Removing image');
    onImageRemove();
  };

  // Add debugging for image URL
  console.log('ImageUpload: Rendering with imageUrl:', 
    imageUrl ? (imageUrl.length > 30 ? imageUrl.substring(0, 30) + '...' : imageUrl) : 'none');

  return (
    <div className={`relative w-full h-full group ${className}`}>
      <div 
        className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 rounded-2xl"
        style={{ 
          backgroundImage: `url(${imageUrl || '/olgaphoto3.jpeg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center z-10">
        <div className="flex gap-2 pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-white/90 hover:bg-white"
            onClick={handleUploadClick}
          >
            <Upload className="h-4 w-4" />
          </Button>
          {imageUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 bg-white/90 hover:bg-white"
              onClick={handleRemoveClick}
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
