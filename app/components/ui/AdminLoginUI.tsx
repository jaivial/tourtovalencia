import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type AdminLoginUIProps = {
  onLogin: (username: string, password: string) => boolean;
  strings: {
    title: string;
    username: string;
    password: string;
    submit: string;
  };
};

export const AdminLoginUI = ({ onLogin, strings }: AdminLoginUIProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">{strings.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{strings.username}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={error ? "border-red-500" : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{strings.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? "border-red-500" : ""}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">
                Invalid username or password
              </p>
            )}
            <Button type="submit" className="w-full">
              {strings.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
