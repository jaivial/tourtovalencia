// UI Component: just responsible for displaying pure html with props passed from feature component
import { motion } from "framer-motion";
import { Link } from "@remix-run/react";
import { Clock, MapPin, CheckCircle, ArrowRight } from "lucide-react";

type FeaturedTourSectionProps = {
  width: number;
  featuredTourText: {
    title: string;
    subtitle: string;
    tourName: string;
    description: string;
    duration: string;
    meetingPoint: string;
    includes: string[];
    price: string;
    bookNow: string;
    learnMore: string;
  };
};

const FeaturedTourSection: React.FC<FeaturedTourSectionProps> = ({ width, featuredTourText }) => {
  return (
    <div className="w-full py-16 bg-gradient-to-b from-white to-blue-50">
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
            {featuredTourText.title}
          </h2>
          <p className={`
            text-blue-700 max-w-2xl mx-auto
            ${width <= 640 ? "text-base" : "text-lg"}
          `}>
            {featuredTourText.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Featured Tour Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-xl overflow-hidden shadow-lg h-[400px]"
          >
            <img 
              src="/featured-tour.jpg" 
              alt={featuredTourText.tourName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/tour-placeholder.jpg";
              }}
            />
          </motion.div>

          {/* Featured Tour Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-bold text-blue-900 mb-4">{featuredTourText.tourName}</h3>
            
            <p className="text-gray-700 mb-6">{featuredTourText.description}</p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-gray-700">{featuredTourText.duration}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-gray-700">{featuredTourText.meetingPoint}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Includes:</h4>
              <ul className="space-y-2">
                {featuredTourText.includes.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8">
              <div className="mb-4 sm:mb-0">
                <span className="text-gray-600 text-sm">From</span>
                <p className="text-3xl font-bold text-blue-800">{featuredTourText.price}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  to="/book?tour=featured-tour"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {featuredTourText.bookNow}
                </Link>
                
                <Link 
                  to="/tours/featured-tour"
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  {featuredTourText.learnMore} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedTourSection; 