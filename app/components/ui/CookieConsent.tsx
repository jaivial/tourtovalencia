import { useEffect, useState } from "react";
import { Form, useLocation } from "@remix-run/react";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useCookieConsent } from "~/providers/CookieConsentContext";
import { Button } from "~/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CookieIcon } from "lucide-react";

const CookieConsent = () => {
  const { state } = useLanguageContext();
  const { hasConsented, setHasConsented } = useCookieConsent();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();
  
  // Default values in case cookieConsent is not available
  const defaultCookieConsent = {
    title: "Cookie Consent",
    description: "We use cookies to enhance your browsing experience.",
    acceptButton: "Accept",
    declineButton: "Decline"
  };
  
  // Get the cookieConsent data from the language state
  // The cookieConsent is nested inside the index object in the state
  const cookieConsentData = state?.index?.cookieConsent || defaultCookieConsent;

  useEffect(() => {
    // Set mounted state to true
    setIsMounted(true);
    
    // Only show the popup if consent hasn't been given yet
    if (hasConsented === null) {
      // Add a small delay to ensure the component is mounted
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hasConsented]);

  // This effect will re-render the component when the language changes
  useEffect(() => {
    // We don't need to do anything here, just depend on state to trigger re-render
  }, [state]);

  const handleClientSideConsent = (consent: boolean) => {
    setHasConsented(consent);
    setIsVisible(false);
  };

  // Don't render anything during server-side rendering or if consent has already been given
  if (!isMounted || hasConsented !== null || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-md z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border border-blue-100 dark:border-blue-900"
          aria-labelledby="cookie-consent-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start mb-4">
            <div className="mr-4 bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <CookieIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 
                id="cookie-consent-title" 
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
              >
                {cookieConsentData.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {cookieConsentData.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end mt-6">
            <Form method="post" className="sm:order-1 w-full sm:w-auto">
              <input type="hidden" name="consent" value="false" />
              <input type="hidden" name="redirectTo" value={location.pathname} />
              <Button
                variant="outline"
                size="sm"
                type="submit"
                onClick={() => handleClientSideConsent(false)}
                className="w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={cookieConsentData.declineButton}
              >
                {cookieConsentData.declineButton}
              </Button>
            </Form>
            <Form method="post" className="sm:order-2 w-full sm:w-auto">
              <input type="hidden" name="consent" value="true" />
              <input type="hidden" name="redirectTo" value={location.pathname} />
              <Button
                variant="default"
                size="sm"
                type="submit"
                onClick={() => handleClientSideConsent(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                aria-label={cookieConsentData.acceptButton}
              >
                {cookieConsentData.acceptButton}
              </Button>
            </Form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent; 