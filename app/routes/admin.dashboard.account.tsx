import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminAccountFeature } from "~/components/features/AdminAccountFeature";
import { loader as accountHooksLoader } from "./admin.dashboard.account.hooks";

export const loader = async () => {
  const accountData = await accountHooksLoader();

  return json({
    ...accountData,
    strings: {
      en: {
        title: "Account Settings",
        currentUsername: "Current Username",
        newUsername: "New Username",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
        updateUsername: "Update Username",
        updatePassword: "Update Password",
        usernameTab: "Username",
        passwordTab: "Password",
        usernameUpdated: "Username updated successfully",
        passwordUpdated: "Password updated successfully",
      },
      es: {
        title: "Configuración de Cuenta",
        currentUsername: "Usuario Actual",
        newUsername: "Nuevo Usuario",
        currentPassword: "Contraseña Actual",
        newPassword: "Nueva Contraseña",
        confirmPassword: "Confirmar Contraseña",
        updateUsername: "Actualizar Usuario",
        updatePassword: "Actualizar Contraseña",
        usernameTab: "Usuario",
        passwordTab: "Contraseña",
        usernameUpdated: "Usuario actualizado correctamente",
        passwordUpdated: "Contraseña actualizada correctamente",
      },
    },
  });
};

export default function AdminDashboardAccountRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <AuthProvider {...data}>
      <AdminAccountFeature />
    </AuthProvider>
  );
}
