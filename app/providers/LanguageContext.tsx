// app/providers/LanguageContext
import { createContext, useContext, useReducer, useEffect } from "react";
import { State, Action, languageReducer } from "~/reducers/LanguageReducer";
import { I18nextProvider } from "react-i18next";
import i18n from "~/utils/i18n/config";
import { useLanguage } from "~/hooks/useTranslation";

// Define the type of the context props
type LanguageContextType = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// LanguageContextProviderProps
type LanguageContextProviderProps = {
  children: React.ReactNode;
  initialState: State;
};

// Create the provider
export const LanguageContextProvider: React.FC<LanguageContextProviderProps> = ({ children, initialState }) => {
  const [state, dispatch] = useReducer(languageReducer, initialState);
  const { currentLang, setLanguage } = useLanguage();

  // Sync i18n with language context
  useEffect(() => {
    if (currentLang !== i18n.language) {
      i18n.changeLanguage(currentLang);
    }
  }, [currentLang]);

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={{ state, dispatch }}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
};

// Custom hook to ease the consumption
export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within LanguageContext.Provider");
  }
  return context;
};
