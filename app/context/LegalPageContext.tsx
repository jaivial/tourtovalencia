import React, { createContext, useContext } from "react";
import { useLegalPageStates } from "~/hooks/useLegalPageHooks";

// Define the context type
type LegalPageContextType = {
  states: ReturnType<typeof useLegalPageStates>;
  languageCode: string;
};

// Create the context with a default value
const LegalPageContextInstance = createContext<LegalPageContextType | undefined>(undefined);

// Custom hook to use the context
export const useLegalPageContext = () => {
  const context = useContext(LegalPageContextInstance);
  if (!context) {
    throw new Error("useLegalPageContext must be used within a LegalPageContext provider");
  }
  return context;
};

// Context provider component
interface LegalPageContextProps {
  children: React.ReactNode;
  languageCode: string;
}

const LegalPageContext: React.FC<LegalPageContextProps> = ({ children, languageCode }) => {
  // Use the custom hook to get all states
  const states = useLegalPageStates(languageCode);

  // Create the context value
  const contextValue: LegalPageContextType = {
    states,
    languageCode,
  };

  return (
    <LegalPageContextInstance.Provider value={contextValue}>
      {children}
    </LegalPageContextInstance.Provider>
  );
};

export default LegalPageContext; 