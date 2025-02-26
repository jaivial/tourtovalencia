import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function AdminDashboardIndexRoute() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido al Panel de Administración</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Seleccione una opción de la barra lateral para administrar su sitio.</p>
        </CardContent>
      </Card>
    </div>
  );
}
