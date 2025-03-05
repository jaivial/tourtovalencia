import { createContext, useContext, useState, useEffect } from "react";

type CookieConsentState = {
  hasConsented: boolean | null;
  setHasConsented: (value: boolean) => void;
};

const CookieConsentContext = createContext<CookieConsentState | undefined>(undefined);

type CookieConsentProviderProps = {
  children: React.ReactNode;
  initialConsent?: boolean | null;
};

export const CookieConsentProvider: React.FC<CookieConsentProviderProps> = ({ 
  children, 
  initialConsent = null 
}) => {
  const [hasConsented, setHasConsentedState] = useState<boolean | null>(initialConsent);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // If initialConsent is provided, use that value
    if (initialConsent !== null) {
      return;
    }
    
    // Otherwise, check localStorage for a stored value
    try {
      const storedConsent = localStorage.getItem("cookie-consent");
      if (storedConsent !== null) {
        setHasConsentedState(storedConsent === "true");
      }
    } catch (error) {
      // Handle case where localStorage is not available
      console.error("Error accessing localStorage:", error);
    }
  }, [initialConsent]);

  const setHasConsented = (value: boolean) => {
    // Store consent in localStorage
    try {
      if (isClient) {
        localStorage.setItem("cookie-consent", value.toString());
      }
      setHasConsentedState(value);
    } catch (error) {
      // Handle case where localStorage is not available
      console.error("Error accessing localStorage:", error);
      setHasConsentedState(value);
    }
  };

  return (
    <CookieConsentContext.Provider value={{ hasConsented, setHasConsented }}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return context;
}; 