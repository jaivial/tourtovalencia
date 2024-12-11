// app/components/layout/footer.tsx
import { useLanguageContext } from "~/providers/LanguageContext";
import { useLocation } from "@remix-run/react";

import { Link } from "@remix-run/react";

const Footer: React.FC = () => {
  const { state } = useLanguageContext();
  const navLinks = state.links;
  const footerText = state.footer;
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Section 1: Company Info */}
        <div className="mx-auto w-[80%] sm:w-auto">
          <h4 className="text-lg font-semibold mb-4">{footerText.firstH4}</h4>
          <p className="text-sm max-w-[350px]">{footerText.firstp}</p>
          <div className="mt-4 flex space-x-4">
            <Link to="#" aria-label="Facebook" className="hover:text-orange-500">
              Facebook
            </Link>
            <Link to="#" aria-label="Instagram" className="hover:text-orange-500">
              Instagram
            </Link>
          </div>
        </div>

        {/* Section 2: Quick Links */}
        <div className="mx-auto w-[80%] sm:w-auto">
          <h4 className="text-lg font-semibold mb-4">{footerText.secondH4}</h4>
          <ul className="text-sm space-y-2">
            {navLinks.map((item) => (
              <li>
                <Link key={item.path} to={item.path} className="hover:text-orange-500">
                  {item.linkText}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3: Contact Info */}
        <div className="mx-auto w-[80%] sm:w-auto">
          <h4 className="text-lg font-semibold mb-4">{footerText.thirdH4}</h4>
          <ul className="text-sm space-y-2">
            <li>
              <span className="font-semibold">{footerText.firstspan}</span>
              <br />
              {footerText.firstli}
            </li>
            <li>
              <span className="font-semibold">{footerText.secondspan}</span>
              <br />
              <Link to="tel:+34123456789" className="hover:text-orange-500">
                +34 123 456 789
              </Link>
            </li>
            <li>
              <span className="font-semibold">{footerText.thirdspan}</span>
              <br />
              <Link to="mailto:info@olgatravel.com" className="hover:text-orange-500">
                info@olgatravel.com
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section: Legal and Copyright */}
      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} jaimedigitalstudio.com All rights reserved.</p>
        <div className="mt-2">
          <Link to="/privacy-policy" className="hover:text-orange-500 mx-2">
            {footerText.privacypolicy}
          </Link>
          <Link to="/terms-of-service" className="hover:text-orange-500 mx-2">
            {footerText.termsofservice}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
