import { useState } from "react";
import { json } from "@remix-run/server-runtime";

interface UseAdminAccountProps {
  initialUsername?: string;
  [key: string]: unknown;
}

export const useAdminAccount = (props: UseAdminAccountProps = {}) => {
  const [username, setUsername] = useState(props.initialUsername || "");
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"username" | "password">("username");
  const [updateSuccess, setUpdateSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (tab: "username" | "password") => {
    setActiveTab(tab);
    setError(null);
    setUpdateSuccess(null);
  };

  const validateUsernameForm = () => {
    if (!newUsername.trim()) {
      setError("El nombre de usuario no puede estar vacío");
      return false;
    }
    
    if (newUsername.trim() === username) {
      setError("El nuevo nombre de usuario debe ser diferente al actual");
      return false;
    }
    
    if (newUsername.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres");
      return false;
    }
    
    return true;
  };

  const validatePasswordForm = () => {
    if (!currentPassword) {
      setError("La contraseña actual es requerida");
      return false;
    }
    
    if (!newPassword) {
      setError("La nueva contraseña es requerida");
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    
    if (newPassword.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return false;
    }
    
    return true;
  };

  const handleUpdateUsername = async () => {
    if (!validateUsernameForm()) return;
    
    setIsLoading(true);
    setError(null);
    setUpdateSuccess(null);
    
    try {
      const response = await fetch("/api/admin/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateUsername",
          newUsername
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsername(newUsername);
        setNewUsername("");
        setUpdateSuccess(true);
      } else {
        setError(data.error || "No se pudo actualizar el nombre de usuario");
      }
    } catch (err) {
      setError("Error al actualizar el nombre de usuario. Intente nuevamente.");
      console.error("Error al actualizar nombre de usuario:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    setError(null);
    setUpdateSuccess(null);
    
    try {
      const response = await fetch("/api/admin/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updatePassword",
          newPassword
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setUpdateSuccess(true);
      } else {
        setError(data.error || "No se pudo actualizar la contraseña");
      }
    } catch (err) {
      setError("Error al actualizar la contraseña. Intente nuevamente.");
      console.error("Error al actualizar contraseña:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForms = () => {
    setNewUsername("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setUpdateSuccess(null);
  };

  return {
    username,
    newUsername,
    setNewUsername,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    activeTab,
    handleTabChange,
    handleUpdateUsername,
    handleUpdatePassword,
    resetForms,
    updateSuccess,
    error,
    ...props
  };
};

// Loader para obtener el nombre de usuario actual
export async function loader() {
  return json({
    username: "admin" // Valor por defecto, se actualizará en el cliente
  });
} 