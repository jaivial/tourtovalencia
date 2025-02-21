// app/components/ComingSoonCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CalendarClock } from "lucide-react";

type ComingSoonCardProps = {
  width: number;
  language: string;
};

const ComingSoonCard: React.FC<ComingSoonCardProps> = ({ width, language }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });

  const text = language === 'en' ? 'Adventure coming soon' : 'Excursión disponible proximamente';
  const description = language === 'en' ? 
    'Stay tuned for updates about this exciting adventure!' : 
    '¡Mantente atento para actualizaciones sobre esta emocionante excursión!';

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
            <CardHeader className="flex flex-col justify-center items-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={isInView ? 
                  { opacity: 1, y: 0 } : 
                  { opacity: 0, y: -20 }
                }
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-blue-600"
              >
                <CalendarClock size={48} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={isInView ? 
                  { opacity: 1, y: 0 } : 
                  { opacity: 0, y: -20 }
                }
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CardTitle className={`
                  text-center bg-gradient-to-r from-blue-900 to-blue-600 
                  bg-clip-text text-transparent font-bold
                  ${width <= 350 ? "text-[1.5rem]" : "text-[2rem]"}
                `}>
                  {text}
                </CardTitle>
              </motion.div>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? 
                  { opacity: 1, y: 0 } : 
                  { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-blue-800/80 text-lg"
              >
                {description}
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ComingSoonCard;
