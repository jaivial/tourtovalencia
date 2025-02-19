import { createContext, useContext, ReactNode } from "react";
import { useStates } from "~/routes/admin.hooks";

type AuthContextType = ReturnType<typeof useStates>;

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, ...props }: { children: ReactNode }) => {
  const states = useStates(props);
  return <AuthContext.Provider value={states}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
