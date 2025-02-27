// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { IndexSection3Type } from "~/data/data";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Child Props type
type ChildProps = {
  width: number;
  indexSection3Text: IndexSection3Type;
};

const IndexSection3: React.FC<ChildProps> = ({ width, indexSection3Text }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });

  const containerVariants = {
    hidden: { 
      opacity: 0,
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.3 + (index * 0.1)
      }
    })
  };

  return (
    <div className="w-full overflow-x-hidden">
      <motion.div 
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="w-[95%] max-w-[1280px] flex flex-row flex-wrap items-center justify-center my-10 mx-auto relative z-[1]"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? 
            { opacity: 1, y: 0 } : 
            { opacity: 0, y: 20 }
          }
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.5 }}
          className={`
            w-full flex ${width <= 1024 ? "flex-col" : "flex-row"} 
            items-center justify-center max-w-[1180px] gap-8 
            bg-white/90 backdrop-blur-sm rounded-3xl p-8 
            shadow-lg hover:shadow-xl 
            transition-all duration-300
            border border-blue-100/50
          `}
        >
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? 
              { opacity: 1, scale: 1 } : 
              { opacity: 0, scale: 0.95 }
            }
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`${width <= 1024 ? "w-full" : "w-1/2"} relative group`}
          >
            <motion.div 
              initial={{ scale: 1 }}
              whileHover={{ 
                scale: 1.03,
                rotateY: 5,
                rotateX: 2
              }}
              transition={{ 
                duration: 0.4,
                type: "spring",
                stiffness: 300
              }}
              className="
                w-full aspect-[3/4] bg-[url('https://images.unsplash.com/photo-1583265101492-bfe6ef35cef8?q=80&w=4000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] 
                bg-cover bg-center rounded-2xl overflow-hidden 
                shadow-md hover:shadow-xl transition-all duration-500
                transform perspective-1000
              "
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={isInView ? 
                  { opacity: 1 } : 
                  { opacity: 0 }
                }
                transition={{ duration: 0.5, delay: 0.4 }}
                className="
                  absolute inset-0 
                  bg-gradient-to-t from-black/40 via-black/20 to-transparent
                  hover:from-black/50 hover:via-black/30
                  transition-all duration-300
                " 
              />
            </motion.div>
          </motion.div>

          {/* Content Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? 
              { opacity: 1, x: 0 } : 
              { opacity: 0, x: 20 }
            }
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`
              ${width <= 1024 ? "w-full" : "w-1/2"} 
              flex flex-col gap-6 p-4
            `}
          >
            <motion.h3 
              initial={{ scale: 1 }}
              whileHover={{ 
                scale: 1.02,
                textShadow: "0 0 8px rgb(30 58 138 / 0.3)"
              }}
              transition={{ duration: 0.2 }}
              className={`
                text-center font-bold 
                bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 
                bg-clip-text text-transparent
                ${width <= 450 ? "text-2xl" : "text-3xl"}
                drop-shadow-sm
              `}
            >
              {indexSection3Text.firstH3}
            </motion.h3>
            
            <div className="space-y-4">
              {[
                indexSection3Text.firstp,
                indexSection3Text.secondp,
                indexSection3Text.thirdp
              ].map((paragraph, index) => (
                <motion.p 
                  key={index}
                  custom={index}
                  variants={textVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  whileHover={{ x: 10, color: "rgb(30 58 138)" }}
                  className={`
                    text-justify leading-relaxed text-blue-900/90
                    hover:text-blue-700 transition-colors duration-300
                    ${width <= 450 ? "text-base" : "text-lg"}
                    cursor-default
                  `}
                >
                  {paragraph}
                </motion.p>
              ))}
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? 
                  { opacity: 1, y: 0 } : 
                  { opacity: 0, y: 20 }
                }
                whileHover={{ 
                  scale: 1.02,
                  color: "rgb(30 58 138)"
                }}
                transition={{ duration: 0.3 }}
                className={`
                  text-center font-medium text-blue-800 mt-6
                  ${width <= 450 ? "text-lg" : "text-xl"}
                  cursor-default
                `}
              >
                {indexSection3Text.fourthp}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IndexSection3;
