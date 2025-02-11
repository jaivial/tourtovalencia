//UI Component: just responsible for displaying pure html with props passed from feature component
import { motion } from "framer-motion";
import { IndexSection5Type } from "~/data/data";
// Child Props type
type ChildProps = {
  width: number;
  indexSection5Text: IndexSection5Type;
};

const IndexSection5: React.FC<ChildProps> = ({ width, indexSection5Text }) => {
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
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className={`
              font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent
              ${width <= 450 ? "text-3xl" : "text-4xl"}
            `}
          >
            {indexSection5Text.firstH3}
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className={`
              text-blue-800
              ${width <= 450 ? "text-xl" : "text-2xl"}
            `}
          >
            {indexSection5Text.secondH3}
          </motion.h3>
        </div>
      </motion.div>
    </div>
  );
};

export default IndexSection5; 