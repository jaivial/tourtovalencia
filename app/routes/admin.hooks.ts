import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";

export const useStates = (props: any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      if (window.location.pathname === "/admin") {
        navigate("/admin/dashboard");
      }
    } else if (window.location.pathname === "/admin/dashboard") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = (username: string, password: string) => {
    if (username === "olga" && password === "olga") {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      navigate("/admin/dashboard");
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    navigate("/admin");
  };

  return {
    isAuthenticated,
    handleLogin,
    handleLogout,
    ...props
  };
};

export async function loader() {
  return json({});
}
