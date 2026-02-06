import { json, redirect } from "@remix-run/server-runtime";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/server-runtime";
import { useLoaderData, Form } from "@remix-run/react";
import { useState } from "react";
import { requireAdminSession } from "~/utils/admin-session.server";
import { getBlogSettings, updateBlogSettings } from "~/models/blogSettings.server";
import { generateBlogPostFromSettings } from "~/utils/blogGenerator.server";
import { calculateNextRunAt } from "~/utils/blogScheduler.server";
import { getBlogSettingsCollection } from "~/utils/db.server";
import { getToursCollection } from "~/utils/db.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await requireAdminSession(request);
  if (!session) {
    throw redirect("/admin");
  }

  const settings = await getBlogSettings();
  const toursCollection = await getToursCollection();
  const tours = await toursCollection.find({ status: "active" }).toArray();

  return json({
    settings,
    tours: tours.map((tour) => ({
      slug: tour.slug,
      name: tour.tourName?.es || tour.tourName?.en || tour.slug,
    })),
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdminSession(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "save");

  if (intent === "generate") {
    const settings = await getBlogSettings();
    const now = new Date();
    await generateBlogPostFromSettings(settings);
    const nextRunAt = calculateNextRunAt(settings, now);
    const collection = await getBlogSettingsCollection();
    await collection.updateOne(
      { key: "default" },
      {
        $set: {
          lastRunAt: now,
          nextRunAt,
          lastError: null,
          updatedAt: new Date(),
        },
      }
    );
    return json({ success: true, generated: true });
  }

  const frequency = String(formData.get("frequency") || "weekly") as "daily" | "weekly" | "monthly";
  const publishHour = Number(formData.get("publishHour") || 10);
  const weeklyDay = Number(formData.get("weeklyDay") || 3);
  const monthlyCount = Number(formData.get("monthlyCount") || 4);
  const wordCountMin = Number(formData.get("wordCountMin") || 400);
  const wordCountMax = Number(formData.get("wordCountMax") || 600);
  const paragraphsMin = Number(formData.get("paragraphsMin") || 6);
  const paragraphsMax = Number(formData.get("paragraphsMax") || 7);
  const includeSeoKeywords = formData.get("includeSeoKeywords") === "true";
  const tone = String(formData.get("tone") || "journalist") as "formal" | "casual" | "friendly" | "professional" | "journalist";
  const selectAllTours = formData.get("selectAllTours") === "true";
  const selectedTourSlugs = formData.getAll("selectedTourSlugs").map(String);

  await updateBlogSettings({
    frequency,
    publishHour,
    weeklyDay,
    monthlyCount,
    selectedTourSlugs,
    selectAllTours,
    wordCountMin,
    wordCountMax,
    paragraphsMin,
    paragraphsMax,
    includeSeoKeywords,
    tone,
  });

  return json({ success: true });
};

const weekdayOptions = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export default function AdminBlogSettingsRoute() {
  const { settings, tours } = useLoaderData<typeof loader>();
  const [frequency, setFrequency] = useState(settings.frequency);
  const [publishHour, setPublishHour] = useState(String(settings.publishHour));
  const [weeklyDay, setWeeklyDay] = useState(String(settings.weeklyDay));
  const [tone, setTone] = useState(settings.tone);
  const [includeSeoKeywords, setIncludeSeoKeywords] = useState(settings.includeSeoKeywords);
  const [selectAllTours, setSelectAllTours] = useState(settings.selectAllTours);

  return (
    <div className="p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Configuración del Blog</CardTitle>
          <CardDescription>Controla la frecuencia y parámetros de generación automática.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-8">
            <input type="hidden" name="frequency" value={frequency} />
            <input type="hidden" name="publishHour" value={publishHour} />
            <input type="hidden" name="weeklyDay" value={weeklyDay} />
            <input type="hidden" name="tone" value={tone} />
            <input type="hidden" name="includeSeoKeywords" value={includeSeoKeywords ? "true" : "false"} />
            <input type="hidden" name="selectAllTours" value={selectAllTours ? "true" : "false"} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Frecuencia</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hora de publicación</Label>
                <Select value={publishHour} onValueChange={setPublishHour}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <SelectItem key={hour} value={String(hour)}>
                        {hour.toString().padStart(2, "0")}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Publicación semanal</Label>
                <Select value={weeklyDay} onValueChange={setWeeklyDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekdayOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Publicaciones mensuales</Label>
                <Input name="monthlyCount" type="number" min={1} max={12} defaultValue={settings.monthlyCount} />
              </div>
              <div className="space-y-2">
                <Label>Palabras mínimas</Label>
                <Input name="wordCountMin" type="number" min={200} max={1200} defaultValue={settings.wordCountMin} />
              </div>
              <div className="space-y-2">
                <Label>Palabras máximas</Label>
                <Input name="wordCountMax" type="number" min={200} max={1200} defaultValue={settings.wordCountMax} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Párrafos mínimos</Label>
                <Input name="paragraphsMin" type="number" min={3} max={12} defaultValue={settings.paragraphsMin} />
              </div>
              <div className="space-y-2">
                <Label>Párrafos máximos</Label>
                <Input name="paragraphsMax" type="number" min={3} max={12} defaultValue={settings.paragraphsMax} />
              </div>
              <div className="space-y-2">
                <Label>Tono</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tono" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Amigable</SelectItem>
                    <SelectItem value="professional">Profesional</SelectItem>
                    <SelectItem value="journalist">Periodístico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label>Incluir investigación SEO</Label>
                  <p className="text-sm text-gray-500">Agregar palabras clave relevantes.</p>
                </div>
                <Switch checked={includeSeoKeywords} onCheckedChange={setIncludeSeoKeywords} />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label>Usar todos los tours</Label>
                  <p className="text-sm text-gray-500">Seleccionar automáticamente todos los tours activos.</p>
                </div>
                <Switch checked={selectAllTours} onCheckedChange={setSelectAllTours} />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tours incluidos</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tours.map((tour: { slug: string; name: string }) => {
                  const checked = selectAllTours || settings.selectedTourSlugs.includes(tour.slug);
                  return (
                    <label key={tour.slug} className="flex items-center gap-3 border rounded-lg p-3">
                      <input
                        type="checkbox"
                        name="selectedTourSlugs"
                        value={tour.slug}
                        defaultChecked={checked}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{tour.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <div className="flex gap-3">
                <Button type="submit" name="intent" value="generate" variant="outline">
                  Generar ahora
                </Button>
                <Button type="submit" name="intent" value="save">
                  Guardar cambios
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t text-sm text-gray-600 space-y-1">
              <p>
                Próxima ejecución:{" "}
                <span className="font-medium">
                  {settings.nextRunAt
                    ? new Date(settings.nextRunAt).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })
                    : "No programado"}
                </span>
              </p>
              <p>
                Última ejecución:{" "}
                <span className="font-medium">
                  {settings.lastRunAt
                    ? new Date(settings.lastRunAt).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })
                    : "Sin ejecuciones"}
                </span>
              </p>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
