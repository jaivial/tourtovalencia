import { useState } from "react";

export const useAdminDashboardStates = () => {
  // Add state management here as needed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    loading,
    setLoading,
    error,
    setError,
  };
}; 