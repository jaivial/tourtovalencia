import { motion } from "framer-motion";
import { IndexSection5Type } from "~/data/data";
import EditableText from "./EditableText";

type EditableIndexSection5Props = {
  width: number;
  data: IndexSection5Type;
  onUpdate: (field: keyof IndexSection5Type, value: string) => void;
};

const EditableIndexSection5: React.FC<EditableIndexSection5Props> = ({ 
  width, 
  data,
  onUpdate
}) => {
  const handleTextUpdate = (field: keyof IndexSection5Type) => (value: string) => {
    onUpdate(field, value);
  };

  return (
    <div className="w-[95%] max-w-[1280px] flex flex-row flex-wrap items-center justify-center mt-20 mb-0 mx-auto relative z-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="w-full flex flex-col items-center justify-center max-w-[1180px] gap-8 bg-white rounded-3xl p-8 shadow-lg"
      >
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <EditableText
              value={data.firstH3}
              onUpdate={handleTextUpdate('firstH3')}
              placeholder="Título principal"
              className={`
                font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent
                ${width <= 450 ? "text-3xl" : "text-4xl"}
              `}
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <EditableText
              value={data.secondH3}
              onUpdate={handleTextUpdate('secondH3')}
              placeholder="Subtítulo"
              className={`
                text-blue-800
                ${width <= 450 ? "text-xl" : "text-2xl"}
              `}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditableIndexSection5;
