import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { sanJuanSection1Type } from "~/data/data";
import ImageUpload from "./ImageUpload";
import EditableText from "./EditableText";
import { useEditableSanJuanSection1 } from "./EditableSanJuanSection1.hooks";

type EditableSanJuanSection1Props = {
  width: number;
  data: sanJuanSection1Type;
  onUpdate: (field: keyof sanJuanSection1Type, value: string | { file?: File; preview: string }) => void;
};

const EditableSanJuanSection1: React.FC<EditableSanJuanSection1Props> = ({ 
  width, 
  data,
  onUpdate
}) => {
  // Add console log to debug the data
  console.log("EditableSanJuanSection1 data:", data);
  
  // Use the hook to manage state
  const { sectionData, handleTextUpdate, handleImageChange, handleImageRemove } = useEditableSanJuanSection1(data);

  // Wrapper functions to call both the hook's functions and the parent's onUpdate
  const handleLocalTextUpdate = (field: keyof sanJuanSection1Type) => (value: string) => {
    handleTextUpdate(field, value);
    onUpdate(field, value);
  };

  const handleLocalImageChange = (file: File) => {
    handleImageChange(file);
    const preview = URL.createObjectURL(file);
    onUpdate('backgroundImage', { file, preview });
  };

  const handleLocalImageRemove = () => {
    handleImageRemove();
    onUpdate('backgroundImage', { preview: "" });
  };

  return (
    <div className="w-[95%] max-w-[1280px] flex flex-row flex-wrap items-center justify-center mb-10 mx-auto relative z-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="w-full flex flex-col items-center justify-center max-w-[1180px] gap-0 bg-white rounded-3xl p-0 shadow-lg"
      >
        {/* Background image with overlay */}
        <div className="w-full h-[600px] relative bg-white rounded-2xl overflow-hidden mb-0 px-0">
          <ImageUpload
            imageUrl={sectionData.backgroundImage?.preview || ""}
            onImageChange={handleLocalImageChange}
            onImageRemove={handleLocalImageRemove}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center gap-8 max-w-4xl mt-10 p-6"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="w-full"
          >
            <EditableText
              value={sectionData.firstH3}
              onUpdate={handleLocalTextUpdate('firstH3')}
              placeholder="Título principal"
              className={`max-w-3xl font-medium ${
                width <= 350 ? "text-xl" : 
                width <= 640 ? "text-2xl" : 
                "text-3xl"
              } text-blue-900`}
            />
          </motion.div>

          {/* Feature highlights */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 w-full"
          >
            {[
              { titleField: 'firstSquareH3', descField: 'firstSquareP' },
              { titleField: 'secondSquareH3', descField: 'secondSquareP' },
              { titleField: 'thirdSquareH3', descField: 'thirdSquareP' }
            ].map((fields, index) => (
              <div key={index} className="bg-blue-50/50 rounded-xl p-6 transform hover:scale-105 transition-transform">
                <EditableText
                  value={sectionData[fields.titleField as keyof sanJuanSection1Type] as string}
                  onUpdate={handleLocalTextUpdate(fields.titleField as keyof sanJuanSection1Type)}
                  placeholder="Título de característica"
                  className="text-2xl font-bold text-blue-900 mb-2"
                />
                <EditableText
                  value={sectionData[fields.descField as keyof sanJuanSection1Type] as string}
                  onUpdate={handleLocalTextUpdate(fields.descField as keyof sanJuanSection1Type)}
                  placeholder="Descripción de característica"
                  className="text-blue-800"
                  multiline={true}
                />
              </div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="group relative">
              <EditableText
                value={sectionData.button}
                onUpdate={handleLocalTextUpdate('button')}
                placeholder="Texto del botón"
                className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-xl rounded-full transition-all duration-300 hover:shadow-lg cursor-pointer inline-block min-w-[200px]"
              />
              <ArrowRight className="absolute right-8 top-1/2 -translate-y-1/2 ml-2 group-hover:translate-x-1 transition-transform text-white" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EditableSanJuanSection1;
