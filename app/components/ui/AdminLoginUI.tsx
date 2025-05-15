import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

type AdminLoginUIProps = {
  onLogin: (username: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  loginError: string | null;
  strings: {
    title: string;
    username: string;
    password: string;
    submit: string;
    invalidCredentials: string;
    pageTitle?: string;
    description?: string;
  };
};

export const AdminLoginUI = ({ onLogin, isLoading, loginError, strings }: AdminLoginUIProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    await onLogin(username, password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">Tour To Valencia Admin</CardTitle>
          {/* <CardDescription className="text-center">{strings.description || "Ingresa tus credenciales para acceder al panel de administración"}</CardDescription> */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{strings.username}</Label>
              <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={loginError ? "border-red-500" : ""} disabled={isLoading} placeholder="Introduce tu nombre de usuario" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{strings.password}</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={loginError ? "border-red-500 pr-10" : "pr-10"} disabled={isLoading} placeholder="Introduce tu contraseña" required />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" onClick={togglePasswordVisibility} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {loginError && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{strings.invalidCredentials || loginError}</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {/* {isLoading ? "Verificando..." : strings.submit} */}
              {isLoading ? "Verificando..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-8 text-sm text-gray-500">© {new Date().getFullYear()} Tour To Valencia. Todos los derechos reservados.</div>
    </div>
  );
};
