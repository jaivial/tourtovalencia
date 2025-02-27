// UI Component: just responsible for displaying pure html with props passed from feature component
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Users, MapPin, Sparkles, Leaf } from "lucide-react";
import { Link } from "@remix-run/react";
import { useLanguageContext } from "~/providers/LanguageContext";
import PropTypes from "prop-types";

type WhyChooseUsProps = {
  width: number;
  whyChooseUsText: {
    title: string;
    subtitle: string;
    reasons: {
      title: string;
      description: string;
      icon: string;
    }[];
  };
};

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ width, whyChooseUsText }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const { state } = useLanguageContext();
  const language = state.currentLanguage === "English" ? "en" : "es";

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  // Multilingual text
  const exploreText = language === "en" ? "Explore Valencia with Us" : "Explora Valencia con Nosotros";
  const bookText = language === "en" ? "Book Your Experience" : "Reserva Tu Experiencia";

  // Function to render the appropriate icon based on the icon name
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "users":
        return <Users className="w-8 h-8 text-blue-600" />;
      case "map-pin":
        return <MapPin className="w-8 h-8 text-blue-600" />;
      case "sparkles":
        return <Sparkles className="w-8 h-8 text-blue-600" />;
      case "leaf":
        return <Leaf className="w-8 h-8 text-blue-600" />;
      default:
        return <Sparkles className="w-8 h-8 text-blue-600" />;
    }
  };

  return (
    <div className="w-full py-20 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      <motion.div 
        ref={containerRef}
        style={{ opacity, scale }}
        className="w-[95%] max-w-[1280px] mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={`
            font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent mb-4
            ${width <= 640 ? "text-3xl" : "text-4xl"}
          `}>
            {whyChooseUsText.title}
          </h2>
          <p className={`
            text-blue-700 max-w-2xl mx-auto
            ${width <= 640 ? "text-base" : "text-lg"}
          `}>
            {whyChooseUsText.subtitle}
          </p>
        </motion.div>

        {/* Background Image */}
        <div className="relative mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            className="w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden"
          >
            <img 
              src="https://images.unsplash.com/photo-1624396372026-dac58b4fb3b8?q=80&w=3157&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Torres de Serranos, Valencia" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent"></div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="absolute bottom-8 left-0 right-0 text-center"
          >
            <h3 className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg">
              {exploreText}
            </h3>
          </motion.div>
        </div>

        {/* Reasons Grid */}
        <div className={`grid ${width <= 768 ? "grid-cols-1 gap-8" : "grid-cols-2 gap-10"}`}>
          {whyChooseUsText.reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex"
            >
              <div className="mr-4 mt-1">
                <div className="p-3 bg-blue-100 rounded-full">
                  {renderIcon(reason.icon)}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{reason.title}</h3>
                <p className="text-gray-600">{reason.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link 
            to="/book" 
            className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 no-underline hover:text-white"
          >
            {bookText}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

WhyChooseUs.propTypes = {
  width: PropTypes.number.isRequired,
  whyChooseUsText: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    reasons: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired
};

export default WhyChooseUs; 