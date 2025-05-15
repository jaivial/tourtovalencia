import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

// Importaciones del servidor solo se usan en el loader/action
import {
  initializeDefaultAdminUser
} from "~/models/adminUser.server";

// Definir un tipo para las props que se pasan al custom hook
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

export const useStates = (props: UseStatesProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      if (window.location.pathname === "/admin") {
        navigate("/admin/dashboard");
      }
    } else if (window.location.pathname.startsWith("/admin/dashboard")) {
      navigate("/admin");
    }
    setIsLoading(false);
  }, [navigate]);

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      // En lugar de llamar directamente a la función del servidor,
      // hacemos una solicitud fetch a un endpoint de la API
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        navigate("/admin/dashboard");
        return true;
      } else {
        setLoginError(data.error || "Usuario o contraseña incorrectos");
        return false;
      }
    } catch (error) {
      console.error("Error al verificar credenciales:", error);
      setLoginError("Error al verificar credenciales. Intente nuevamente.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Limpiar el estado de autenticación
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    
    // Redirigir al usuario a la página de login
    navigate("/admin");
  };

  return {
    isAuthenticated,
    isLoading,
    loginError,
    handleLogin,
    handleLogout,
    ...props,
  };
};

// Estas funciones solo se ejecutan en el servidor
export async function loader() {
  // Inicializa el usuario administrador por defecto si no existe
  try {
    await initializeDefaultAdminUser();
  } catch (error) {
    console.error("Error al inicializar usuario admin:", error);
    // No fallamos la carga si hay error, simplemente lo registramos
  }
  
  return json({});
}
