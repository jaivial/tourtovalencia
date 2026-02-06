import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

export interface UseStatesProps {
  strings?: {
    en: {
      [key: string]: string;
    };
    es: {
      [key: string]: string;
    };
  };
}

export const useStates = (props: UseStatesProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const loaderData = useLoaderData();
  
  useEffect(() => {
    setIsLoading(false);
  }, []);
  
  const handleLogin = async (username: string, password: string) => {
    console.log("[ADMIN-HOOKS] handleLogin called for:", username);
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      
      console.log("[ADMIN-HOOKS] Calling /api/admin/login...");
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      
      console.log("[ADMIN-HOOKS] Response status:", response.status);
      const data = await response.json();
      console.log("[ADMIN-HOOKS] Response data:", data);
      
      if (data.success) {
        console.log("[ADMIN-HOOKS] Login successful, navigating to /admin/dashboard");
        navigate("/admin/dashboard");
        return true;
      } else {
        console.log("[ADMIN-HOOKS] Login failed:", data.error);
        setLoginError(data.error || "Usuario o contraseña incorrectos");
        return false;
      }
    } catch (error) {
      console.log("[ADMIN-HOOKS] Login error:", error);
      setLoginError("Error al verificar credenciales. Intente nuevamente.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });
      
      if (response.ok) {
        navigate("/admin");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/admin");
    }
  };

  return {
    isAuthenticated: (loaderData as any)?.isAuthenticated || false,
    isLoading,
    loginError,
    handleLogin,
    handleLogout,
    strings: props.strings,
  };
};
