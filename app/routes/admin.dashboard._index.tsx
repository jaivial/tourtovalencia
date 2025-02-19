import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function AdminDashboardIndexRoute() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Select an option from the sidebar to manage your site.</p>
        </CardContent>
      </Card>
    </div>
  );
}
