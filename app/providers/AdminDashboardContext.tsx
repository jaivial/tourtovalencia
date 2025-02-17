import React, { createContext, useContext } from "react";
import { useAdminDashboardStates } from "~/hooks/useAdminDashboardStates";

type AdminDashboardContextType = {
  state: ReturnType<typeof useAdminDashboardStates>;
};

const AdminDashboardContext = createContext<AdminDashboardContextType | undefined>(undefined);

export const AdminDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const state = useAdminDashboardStates();

  return (
    <AdminDashboardContext.Provider value={{ state }}>
      {children}
    </AdminDashboardContext.Provider>
  );
};

export const useAdminDashboardContext = () => {
  const context = useContext(AdminDashboardContext);
  if (context === undefined) {
    throw new Error("useAdminDashboardContext must be used within a AdminDashboardProvider");
  }
  return context;
}; 