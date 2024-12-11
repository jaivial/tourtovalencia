// app/providers/LanguageContext
import { createContext, useContext, useReducer } from "react";
import { State, Action, languageReducer } from "~/reducers/LanguageReducer";

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

// Creat the provider
export const LanguageContextProvider: React.FC<LanguageContextProviderProps> = ({ children, initialState }) => {
  const [state, dispatch] = useReducer(languageReducer, initialState);
  return <LanguageContext.Provider value={{ state, dispatch }}>{children}</LanguageContext.Provider>;
};

// Custom hook to ease the consumption
export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within LanguageContext.Provider");
  }
  return context;
};
