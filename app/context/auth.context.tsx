import React, { createContext, useContext } from "react";
import { useStates } from "~/routes/admin.hooks";

// Definir tipo para las props del useStates
interface UseStatesProps {
  strings: {
    en: {
      title: string;
      username: string;
      password: string;
      submit: string;
      invalidCredentials: string;
      [key: string]: string;
    };
    es: {
      title: string;
      username: string;
      password: string;
      submit: string;
      invalidCredentials: string;
      [key: string]: string;
    };
  };
  [key: string]: unknown;
}

// Crear el contexto
const AuthContext = createContext<ReturnType<typeof useStates> | null>(null);

// Definir tipo para las props del AuthProvider
type AuthProviderProps = React.PropsWithChildren<UseStatesProps>;

// Proveedor del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children, ...props }) => {
  const states = useStates(props);

  return <AuthContext.Provider value={states}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
