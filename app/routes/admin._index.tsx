import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminLoginFeature } from "~/components/features/AdminLoginFeature";
import { languages } from "~/data/data";
import { initializeDefaultAdminUser } from "~/models/adminUser.server";

export const loader = async () => {
  // Inicializar usuario admin por defecto si no existe
  try {
    await initializeDefaultAdminUser();
  } catch (error) {
    console.error("Error al inicializar usuario admin:", error);
  }

  return json({
    strings: {
      en: {
        ...languages.en.admin.login,
        invalidCredentials: "Invalid username or password",
      },
      es: {
        ...languages.es.admin.login,
        invalidCredentials: "Usuario o contraseña incorrectos",
      },
    },
  });
};

export default function AdminLoginRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <AuthProvider {...data}>
      <AdminLoginFeature />
    </AuthProvider>
  );
}
