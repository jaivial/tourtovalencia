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
    const collection = await getBlogSettingsCollection();
    try {
      await generateBlogPostFromSettings(settings);
      const nextRunAt = calculateNextRunAt(settings, now);
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await collection.updateOne(
        { key: "default" },
        {
          $set: {
            lastError: message,
            updatedAt: new Date(),
          },
        }
      );
      return json({ success: false, error: message }, { status: 500 });
    }
  }

  const frequency = String(formData.get("frequency") || "weekly") as "daily" | "weekly" | "monthly";
  const publishHour = Number(formData.get("publishHour") || 10);
  const selectedWeekdays = formData.getAll("selectedWeekdays").map((value) => Number(value));
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
    selectedWeekdays: selectedWeekdays.length > 0 ? selectedWeekdays : [3],
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
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export default function AdminBlogSettingsRoute() {
  const { settings, tours } = useLoaderData<typeof loader>();
  const [frequency, setFrequency] = useState(settings.frequency);
  const [publishHour, setPublishHour] = useState(String(settings.publishHour));
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>(settings.selectedWeekdays || [3]);
  const [tone, setTone] = useState(settings.tone);
  const [includeSeoKeywords, setIncludeSeoKeywords] = useState(settings.includeSeoKeywords);
  const [selectAllTours, setSelectAllTours] = useState(settings.selectAllTours);
  const [monthlyCount, setMonthlyCount] = useState(String(settings.monthlyCount));
  const [wordRange, setWordRange] = useState(`${settings.wordCountMin}-${settings.wordCountMax}`);
  const [paragraphRange, setParagraphRange] = useState(`${settings.paragraphsMin}-${settings.paragraphsMax}`);

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
            {selectedWeekdays.map((day) => (
              <input key={day} type="hidden" name="selectedWeekdays" value={String(day)} />
            ))}
            <input type="hidden" name="tone" value={tone} />
            <input type="hidden" name="includeSeoKeywords" value={includeSeoKeywords ? "true" : "false"} />
            <input type="hidden" name="selectAllTours" value={selectAllTours ? "true" : "false"} />
            <input type="hidden" name="monthlyCount" value={monthlyCount} />
            <input type="hidden" name="wordCountMin" value={wordRange.split("-")[0]} />
            <input type="hidden" name="wordCountMax" value={wordRange.split("-")[1]} />
            <input type="hidden" name="paragraphsMin" value={paragraphRange.split("-")[0]} />
            <input type="hidden" name="paragraphsMax" value={paragraphRange.split("-")[1]} />

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

              {(frequency === "daily" || frequency === "weekly") && (
                <div className="space-y-2 md:col-span-2">
                  <Label>Selecciona días de publicación</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {weekdayOptions.map((option) => {
                      const isSelected = selectedWeekdays.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSelectedWeekdays((prev) => {
                              if (prev.includes(option.value)) {
                                return prev.filter((day) => day !== option.value);
                              }
                              return [...prev, option.value].sort((a, b) => a - b);
                            });
                          }}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:border-blue-300"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {frequency === "monthly" && (
                <div className="space-y-2">
                  <Label>Publicaciones mensuales</Label>
                  <Select value={monthlyCount} onValueChange={setMonthlyCount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }).map((_, index) => (
                        <SelectItem key={index + 1} value={String(index + 1)}>
                          {index + 1} por mes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Rango de palabras</Label>
                <Select value={wordRange} onValueChange={setWordRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {["300-400", "400-600", "600-800", "800-1000", "1000-1200", "1200-1500"].map((range) => (
                      <SelectItem key={range} value={range}>
                        {range} palabras
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rango de párrafos</Label>
                <Select value={paragraphRange} onValueChange={setParagraphRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {["4-5", "6-7", "8-9", "10-11", "12-13", "14-15"].map((range) => (
                      <SelectItem key={range} value={range}>
                        {range} párrafos
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 md:col-span-1">
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
