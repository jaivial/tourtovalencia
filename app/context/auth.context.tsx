import React, { createContext, useContext } from "react";
import { useStates, type UseStatesProps } from "~/routes/admin.hooks";

const AuthContext = createContext<ReturnType<typeof useStates> | null>(null);

type AuthProviderProps = React.PropsWithChildren<Partial<UseStatesProps>> & { 
  isAuthenticated?: boolean;
  redirectTo?: string;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, isAuthenticated, redirectTo, ...props }) => {
  const states = useStates({
    strings: props.strings,
  });

  return <AuthContext.Provider value={{ ...states, isAuthenticated }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
