// UI Component: just responsible for displaying pure html with props passed from feature component
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

type NewsletterSectionProps = {
  width: number;
  newsletterText: {
    title: string;
    subtitle: string;
    placeholder: string;
    button: string;
    success: string;
  };
};

const NewsletterSection: React.FC<NewsletterSectionProps> = ({ width, newsletterText }) => {
  return (
    <div className="w-full py-16 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
      <div className="w-[95%] max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className={`
            font-bold mb-4
            ${width <= 640 ? "text-3xl" : "text-4xl"}
          `}>
            {newsletterText.title}
          </h2>
          <p className={`
            text-blue-100 max-w-2xl mx-auto
            ${width <= 640 ? "text-base" : "text-lg"}
          `}>
            {newsletterText.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900 w-5 h-5" />
              <input
                type="email"
                placeholder={newsletterText.placeholder}
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition-colors text-blue-900"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              {newsletterText.button}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default NewsletterSection; 