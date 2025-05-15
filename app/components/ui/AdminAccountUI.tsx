import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

interface AdminAccountUIProps {
  username: string;
  newUsername: string;
  onNewUsernameChange: (value: string) => void;
  currentPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  isLoading: boolean;
  activeTab: "username" | "password";
  onTabChange: (tab: "username" | "password") => void;
  onUpdateUsername: () => void;
  onUpdatePassword: () => void;
  updateSuccess: boolean | null;
  error: string | null;
  strings: any; // TODO: Añadir tipo cuando se agreguen las cadenas de texto
}

export const AdminAccountUI = ({ username, newUsername, onNewUsernameChange, currentPassword, onCurrentPasswordChange, newPassword, onNewPasswordChange, confirmPassword, onConfirmPasswordChange, isLoading, activeTab, onTabChange, onUpdateUsername, onUpdatePassword, updateSuccess, error, strings }: AdminAccountUIProps) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    switch (field) {
      case "current":
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case "new":
        setShowNewPassword(!showNewPassword);
        break;
      case "confirm":
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Configuración de Cuenta</h1>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Administrador</CardTitle>
          <CardDescription>Actualiza tus credenciales de acceso al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as "username" | "password")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="username">Nombre de Usuario</TabsTrigger>
              <TabsTrigger value="password">Contraseña</TabsTrigger>
            </TabsList>

            <TabsContent value="username">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdateUsername();
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="current-username">Usuario Actual</Label>
                  <Input id="current-username" type="text" value={username} disabled className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-username">Nuevo Usuario</Label>
                  <Input id="new-username" type="text" value={newUsername} onChange={(e) => onNewUsernameChange(e.target.value)} disabled={isLoading} placeholder="Nuevo nombre de usuario" />
                </div>

                {error && activeTab === "username" && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                {updateSuccess && activeTab === "username" && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Usuario actualizado correctamente</span>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading || !newUsername.trim()}>
                  {isLoading ? "Actualizando..." : "Actualizar Usuario"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="password">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdatePassword();
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="current-password">Contraseña Actual</Label>
                  <div className="relative">
                    <Input id="current-password" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => onCurrentPasswordChange(e.target.value)} disabled={isLoading} placeholder="Contraseña actual" className="pr-10" />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" onClick={() => togglePasswordVisibility("current")} tabIndex={-1}>
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input id="new-password" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => onNewPasswordChange(e.target.value)} disabled={isLoading} placeholder="Nueva contraseña" className="pr-10" />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" onClick={() => togglePasswordVisibility("new")} tabIndex={-1}>
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => onConfirmPasswordChange(e.target.value)} disabled={isLoading} placeholder="Confirmar nueva contraseña" className="pr-10" />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" onClick={() => togglePasswordVisibility("confirm")} tabIndex={-1}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && activeTab === "password" && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                {updateSuccess && activeTab === "password" && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Contraseña actualizada correctamente</span>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}>
                  {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
