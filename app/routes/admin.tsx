import { Outlet } from "@remix-run/react";
import { AdminLoadingScreen } from "~/components/ui/AdminLoadingScreen";
import { useEffect, useState } from "react";

export default function AdminRoute() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular un tiempo de carga para mostrar el loading screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <AdminLoadingScreen message="Cargando área de administración..." />;
  }

  return <Outlet />;
}
