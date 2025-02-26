// UI Component: just responsible for displaying pure html with props passed from feature component
import { motion } from "framer-motion";
import { Heart, Users, Globe, Award } from "lucide-react";

type AboutUsSectionProps = {
  width: number;
  aboutUsText: {
    title: string;
    subtitle: string;
    description: string;
    values: {
      title: string;
      items: Array<{
        icon: string;
        title: string;
        description: string;
      }>;
    };
  };
};

const AboutUsSection: React.FC<AboutUsSectionProps> = ({ width, aboutUsText }) => {
  // Map icon names to Lucide components
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "heart":
        return <Heart className="w-8 h-8 text-blue-600" />;
      case "users":
        return <Users className="w-8 h-8 text-blue-600" />;
      case "globe":
        return <Globe className="w-8 h-8 text-blue-600" />;
      case "award":
        return <Award className="w-8 h-8 text-blue-600" />;
      default:
        return <Heart className="w-8 h-8 text-blue-600" />;
    }
  };

  return (
    <div className="w-full py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-[95%] max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className={`
            font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent mb-4
            ${width <= 640 ? "text-3xl" : "text-4xl"}
          `}>
            {aboutUsText.title}
          </h2>
          <p className={`
            text-blue-700 max-w-2xl mx-auto
            ${width <= 640 ? "text-base" : "text-lg"}
          `}>
            {aboutUsText.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* About Us Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-xl overflow-hidden shadow-lg h-[400px]"
          >
            <img 
              src="/about-us.jpg" 
              alt="About Tour To Valencia"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
              }}
            />
          </motion.div>

          {/* About Us Description */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {aboutUsText.description}
            </p>
          </motion.div>
        </div>

        {/* Our Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className={`
            font-bold text-blue-900 text-center mb-10
            ${width <= 640 ? "text-2xl" : "text-3xl"}
          `}>
            {aboutUsText.values.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutUsText.values.items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center"
              >
                <div className="mb-4">
                  {getIcon(item.icon)}
                </div>
                <h4 className="text-xl font-semibold text-blue-900 mb-3">{item.title}</h4>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUsSection; 