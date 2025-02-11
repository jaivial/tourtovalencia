// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { IndexSection3Type } from "~/data/data";
import { motion } from "framer-motion";

// Child Props type
type ChildProps = {
  width: number;
  indexSection3Text: IndexSection3Type;
};

const IndexSection3: React.FC<ChildProps> = ({ width, indexSection3Text }) => {
  return (
    <div className={`w-[95%] max-w-[1280px] flex flex-row flex-wrap items-center justify-center my-10 mx-auto relative z-0`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={`w-full flex ${width <= 1024 ? "flex-col" : "flex-row"} items-center justify-center max-w-[1180px] gap-8 bg-white rounded-3xl p-8 shadow-lg`}
      >
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className={`${width <= 1024 ? "w-full" : "w-1/2"} relative group`}
        >
          <div className="w-full aspect-[4/3] bg-[url('/sanjuanbarca.jpg')] bg-cover bg-center rounded-2xl overflow-hidden transform transition-transform duration-500 group-hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className={`${width <= 1024 ? "w-full" : "w-1/2"} flex flex-col gap-6 p-4`}
        >
          <h3 className={`
            text-center font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent
            ${width <= 450 ? "text-2xl" : "text-3xl"}
          `}>
            {indexSection3Text.firstH3}
          </h3>
          
          <div className="space-y-4">
            {[
              indexSection3Text.firstp,
              indexSection3Text.secondp,
              indexSection3Text.thirdp
            ].map((paragraph, index) => (
              <p 
                key={index}
                className={`
                  text-justify leading-relaxed text-blue-900
                  ${width <= 450 ? "text-base" : "text-lg"}
                `}
              >
                {paragraph}
              </p>
            ))}
            
            <p className={`
              text-center font-medium text-blue-800 mt-6
              ${width <= 450 ? "text-lg" : "text-xl"}
            `}>
              {indexSection3Text.fourthp}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IndexSection3;
