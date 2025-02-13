// app/components/_index/IndexFeatures.tsx
import { Clock, Tag, Languages, Dog, Ban } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { IndexFeaturesType } from "~/data/data";

type FeatureProps = {
  width: number;
  indexFeatures: IndexFeaturesType;
};

const FeatureCard = ({ children, index }: { children: React.ReactNode; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-all"
    >
      {children}
    </motion.div>
  );
};

const IndexFeatures: React.FC<FeatureProps> = ({ width, indexFeatures }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });

  return (
    <div className="w-full overflow-x-hidden">
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? 
          { opacity: 1, y: 0 } : 
          { opacity: 0, y: 30 }
        }
        transition={{ duration: 0.8 }}
        className="w-[95%] max-w-[1280px] flex flex-col items-center justify-center my-10 mx-auto relative z-[1]"
      >
        <div className={`w-full grid ${width <= 768 ? "grid-cols-1 gap-8" : "grid-cols-2 lg:grid-cols-4 gap-6"} p-4`}>
          {/* Reservas Section */}
          <FeatureCard index={0}>
            <motion.div
              whileHover={{ rotate: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Clock className="w-12 h-12 text-blue-950 mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-blue-950 mb-3">{indexFeatures.firstSquareTitle}</h3>
            <p className="text-blue-800">{indexFeatures.firstSquareDescription}</p>
          </FeatureCard>

          {/* Precios Section */}
          <FeatureCard index={1}>
            <motion.div
              whileHover={{ rotate: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Tag className="w-12 h-12 text-blue-950 mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-blue-950 mb-3">{indexFeatures.secondSquareTitle}</h3>
            <p className="text-blue-800">{indexFeatures.secondSquareDescription}</p>
          </FeatureCard>

          {/* Idiomas Section */}
          <FeatureCard index={2}>
            <motion.div
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
            >
              <Languages className="w-12 h-12 text-blue-950 mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-blue-950 mb-3">{indexFeatures.thirdSquareTitle}</h3>
            <p className="text-blue-800">{indexFeatures.thirdSquareDescription}</p>
          </FeatureCard>

          {/* Mascotas Section */}
          <FeatureCard index={3}>
            <motion.div 
              className="relative mb-4"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Dog className="w-12 h-12 text-blue-950" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Ban className="w-12 h-12 text-red-500/80 absolute top-0 left-0" />
              </motion.div>
            </motion.div>
            <h3 className="text-xl font-semibold text-blue-950 mb-3">{indexFeatures.fourthSquareTitle}</h3>
            <p className="text-blue-800">{indexFeatures.fourthSquareDescription}</p>
          </FeatureCard>
        </div>
      </motion.div>
    </div>
  );
};

export default IndexFeatures;
