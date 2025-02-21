import { Button } from "../ui/button";
import { Upload, X } from "lucide-react";

type ImageUploadProps = {
  imagePreview: string | null | undefined;
  defaultImage?: string;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  imagePreview,
  defaultImage = '/olgaphoto3.jpeg',
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
      if (target.files) {
        onImageChange({ target } as React.ChangeEvent<HTMLInputElement>);
      }
    };
    input.click();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onImageRemove();
  };

  return (
    <div className="relative w-full h-full group">
      <div 
        className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 rounded-2xl"
        style={{ 
          backgroundImage: `url(${imagePreview || defaultImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center z-10">
        <div className="flex gap-2 pointer-events-auto">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleUploadClick}
            className="bg-white/90 hover:bg-white text-blue-900 font-medium"
          >
            <Upload className="w-4 h-4 mr-2" />
            Cambiar imagen
          </Button>
          
          {imagePreview && (
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={handleRemoveClick}
              className="bg-red-500/90 hover:bg-red-500 text-white font-medium"
            >
              <X className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
