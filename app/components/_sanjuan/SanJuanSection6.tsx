// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SanJuanSection6Type } from "~/data/data";
import { Check } from "lucide-react";
import { Button } from "../ui/button";

// Child Props type
type ChildProps = {
  width: number;
  SanJuanSection6Text: SanJuanSection6Type;
};

const SanJuanSection6: React.FC<ChildProps> = ({ width, SanJuanSection6Text }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });

  // Handle case where list might be a JSON string instead of an array
  const getList = () => {
    if (Array.isArray(SanJuanSection6Text.list)) {
      return SanJuanSection6Text.list;
    }
    
    // Try to parse if it's a string
    if (typeof SanJuanSection6Text.list === 'string') {
      try {
        const parsed = JSON.parse(SanJuanSection6Text.list);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse list:', e);
        return [];
      }
    }
    
    // If list is null or undefined, return empty array
    if (SanJuanSection6Text.list === null || SanJuanSection6Text.list === undefined) {
      return [];
    }
    
    console.error('Unexpected list type:', typeof SanJuanSection6Text.list, SanJuanSection6Text.list);
    return [];
  };

  // Get the list items
  const listItems = getList();

  return (
    <div className="w-full overflow-x-hidden">
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? 
          { opacity: 1, y: 0 } : 
          { opacity: 0, y: 50 }
        }
        transition={{ duration: 0.8 }}
        className="w-full flex flex-col items-center justify-center relative z-[1] mb-24"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? 
            { opacity: 1, scale: 1 } : 
            { opacity: 0, scale: 0.95 }
          }
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.5 }}
          className="w-[95%] max-w-[600px] mx-auto px-4"
        >
          <Card className="backdrop-blur-md bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-col justify-center items-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={isInView ? 
                  { opacity: 1, y: 0 } : 
                  { opacity: 0, y: -20 }
                }
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CardTitle className={`
                  text-center bg-gradient-to-r from-blue-900 to-blue-600 
                  bg-clip-text text-transparent font-bold
                  ${width <= 350 ? "text-[1.5rem]" : "text-[2rem]"}
                `}>
                  {SanJuanSection6Text.cardTitle}
                </CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? 
                  { opacity: 1, y: 0 } : 
                  { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CardDescription className={`
                  text-center text-blue-800/80
                  ${width <= 350 ? "text-[1rem]" : "text-[1.2rem]"}
                `}>
                  {SanJuanSection6Text.cardDescription}
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className={`${width <= 350 ? "px-4" : "px-8"}`}>
              <motion.h4
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? 
                  { opacity: 1, x: 0 } : 
                  { opacity: 0, x: -20 }
                }
                transition={{ duration: 0.5, delay: 0.4 }}
                className="font-semibold text-blue-900 text-xl mb-6"
              >
                {SanJuanSection6Text.firstH4}
              </motion.h4>
              <ul className={`flex flex-col gap-6 mt-2 ${
                width < 350 ? "ml-0 text-[0.9rem]" : 
                width < 500 ? "ml-2 text-[0.9rem]" : 
                "ml-6"
              }`}>
                {listItems.map((li, index) => (
                  <motion.li 
                    key={li.index || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? 
                      { opacity: 1, x: 0 } : 
                      { opacity: 0, x: -20 }
                    }
                    transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                    whileHover={{ x: 10 }}
                    className="flex flex-row items-start justify-start gap-4 group" 
                  >
                    <motion.div 
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-full p-2 bg-blue-100 group-hover:bg-blue-200 transition-colors"
                    >
                      <Check className="h-5 w-5 text-blue-700" />
                    </motion.div>
                    <p className="text-blue-800/90 leading-relaxed pt-1">
                      {li.li}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col justify-center items-center gap-8 p-8 bg-gradient-to-b from-transparent to-blue-50/50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? 
                  { opacity: 1, scale: 1 } : 
                  { opacity: 0, scale: 0.9 }
                }
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-center"
              >
                <motion.h4 
                  whileHover={{ scale: 1.05 }}
                  className={`
                    font-extrabold tracking-wider text-blue-900
                    ${width <= 350 ? "text-4xl" : "text-5xl"}
                  `}
                >
                  {SanJuanSection6Text.secondH4}
                </motion.h4>
                <span className="text-sm font-medium text-blue-600 mt-2 block">
                  {SanJuanSection6Text.secondH4span}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? 
                  { opacity: 1, y: 0 } : 
                  { opacity: 0, y: 20 }
                }
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Button className={`
                  bg-blue-800 hover:bg-blue-700 text-white rounded-full 
                  shadow-lg hover:shadow-xl transition-all duration-300
                  ${width <= 350 ? "px-6 py-5 text-base" : "px-8 py-6 text-lg"}
                `}>
                  {SanJuanSection6Text.button}
                </Button>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SanJuanSection6;
