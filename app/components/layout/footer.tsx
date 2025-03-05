// app/components/layout/footer.tsx
import { useLanguageContext } from "~/providers/LanguageContext";
import { Link } from "@remix-run/react";

// Import icons for social media
import { FaFacebook, FaInstagram } from "react-icons/fa";

const Footer: React.FC = () => {
  const { state } = useLanguageContext();
  const navLinks = state.links;
  const footerText = state.footer;
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16">
      <div className="container mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Section 1: Company Info */}
        <div className="mx-auto w-[90%] sm:w-auto transition-transform duration-300 hover:scale-105">
          <img src="/tourtovalencialogo.png" alt="Tour to Valencia" className="h-16 mb-6" />
          <p className="text-gray-300 text-base leading-relaxed max-w-[350px] mb-6">{footerText.firstp}</p>
          
          {/* Social Media Links */}
          <div className="flex space-x-4 mt-4">
            <a 
              href="https://www.facebook.com/tour.to.valencia" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
              aria-label="Facebook"
            >
              <FaFacebook className="h-6 w-6" />
            </a>
            <a 
              href="https://www.instagram.com/tourtovalencia" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-pink-400 transition-colors duration-300"
              aria-label="Instagram"
            >
              <FaInstagram className="h-6 w-6" />
            </a>
          </div>
        </div>

        {/* Section 2: Quick Links */}
        <div className="mx-auto w-[90%] sm:w-auto">
          <h4 className="text-xl font-bold mb-6 text-blue-300">{footerText.secondH4}</h4>
          <ul className="text-base space-y-3">
            {navLinks.map((item) => (
              <li key={item.linkText} className="transform transition-transform duration-300 hover:translate-x-2">
                <Link key={item.path} to={item.path} className="text-gray-300 hover:text-white transition-colors duration-300">
                  {item.linkText}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3: Contact Info */}
        <div className="mx-auto w-[90%] sm:w-auto">
          <h4 className="text-xl font-bold mb-6 text-blue-300">{footerText.thirdH4}</h4>
          <ul className="text-base space-y-4">
            {/* <li className="transition-all duration-300 hover:bg-gray-800/50 p-3 rounded-lg">
              <span className="font-semibold text-blue-200 block mb-1">{footerText.firstspan}</span>
              <span className="text-gray-300">{footerText.firstli}</span>
            </li> */}
            <li className="transition-all duration-300 hover:bg-gray-800/50 p-3 rounded-lg">
              <span className="font-semibold text-blue-200 block mb-1">{footerText.secondspan}</span>
              <Link to="tel:+34625291391" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 block">
                +34 625 291 391
              </Link>
            </li>
            <li className="transition-all duration-300 hover:bg-gray-800/50 p-3 rounded-lg">
              <span className="font-semibold text-blue-200 block mb-1">{footerText.thirdspan}</span>
              <Link to="mailto:tourtovalencia@gmail.com" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 block">
                tourtovalencia@gmail.com
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section: Legal and Copyright */}
      <div className="border-t border-gray-700/50 mt-12 pt-8 text-center">
        <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} jaimedigitalstudio.com All rights reserved.</p>
        <div className="mt-4 space-x-6">
          <Link to="/privacy-policy" className="text-gray-400 hover:text-blue-300 transition-colors duration-300 text-sm">
            {footerText.privacypolicy}
          </Link>
          <Link to="/terms-of-service" className="text-gray-400 hover:text-blue-300 transition-colors duration-300 text-sm">
            {footerText.termsofservice}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
