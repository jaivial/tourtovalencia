import { json, redirect } from "@remix-run/server-runtime";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/server-runtime";
import { useLoaderData, Form, useFetcher, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { requireAdminSession } from "~/utils/admin-session.server";
import { getBlogSettings, updateBlogSettings } from "~/models/blogSettings.server";
import { generateBlogPostFromSettings } from "~/utils/blogGenerator.server";
import { calculateNextRunAt } from "~/utils/blogScheduler.server";
import { getBlogSettingsCollection } from "~/utils/db.server";
import { getToursCollection } from "~/utils/db.server";
import type { BlogSettings } from "~/utils/db.schema.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

type BlogGenerationJob = {
  status: "pending" | "processing" | "completed" | "failed";
  message: string;
  error?: string;
  slug?: string;
  startTime: Date;
};

const blogGenerationJobs = new Map<string, BlogGenerationJob>();
const BLOG_JOB_TTL_MS = 60 * 60 * 1000;

function cleanupExpiredBlogJobs() {
  const cutoff = Date.now() - BLOG_JOB_TTL_MS;
  for (const [jobId, job] of blogGenerationJobs.entries()) {
    if (job.startTime.getTime() < cutoff) {
      blogGenerationJobs.delete(jobId);
    }
  }
}

function startBlogGenerationJob(settings: BlogSettings): string {
  const jobId = `blog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  blogGenerationJobs.set(jobId, {
    status: "pending",
    message: "Job en cola",
    startTime: new Date(),
  });

  setTimeout(async () => {
    console.log("[BLOG-JOB] Starting job:", jobId);
    const collection = await getBlogSettingsCollection();
    const now = new Date();

    try {
      blogGenerationJobs.set(jobId, {
        ...blogGenerationJobs.get(jobId)!,
        status: "processing",
        message: "Generando contenido del blog",
      });

      console.log("[BLOG-JOB] Calling generateBlogPostFromSettings");
      const post = await generateBlogPostFromSettings(settings);
      console.log("[BLOG-JOB] Post generated:", post.slug);
      const nextRunAt = calculateNextRunAt(settings, now);

      await collection.updateOne(
        { key: "default" },
        {
          $set: {
            lastRunAt: now,
            nextRunAt,
            updatedAt: new Date(),
          },
          $unset: {
            lastError: "",
          },
        },
      );

      blogGenerationJobs.set(jobId, {
        ...blogGenerationJobs.get(jobId)!,
        status: "completed",
        message: "Post generado correctamente",
        slug: post.slug,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[BLOG-JOB] Error generating post:", message);

      blogGenerationJobs.set(jobId, {
        ...blogGenerationJobs.get(jobId)!,
        status: "failed",
        message: "Error al generar el post",
        error: message,
      });

      try {
        await collection.updateOne(
          { key: "default" },
          {
            $set: {
              lastError: message,
              updatedAt: new Date(),
            },
          },
        );
      } catch (updateError) {
        console.error("Failed to persist blog generation error:", updateError);
      }
    } finally {
      cleanupExpiredBlogJobs();
    }
  }, 0);

  return jobId;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await requireAdminSession(request);
  if (!session) {
    throw redirect("/admin");
  }

  const settings = await getBlogSettings();
  const toursCollection = await getToursCollection();
  const tours = await toursCollection.find({ status: "active" }).toArray();
  
  // Calculate scheduler status
  const now = new Date();
  const isLocked = settings.lockedUntil ? new Date(settings.lockedUntil) > now : false;
  const isOverdue = settings.nextRunAt ? new Date(settings.nextRunAt) <= now : false;
  
  // Count total posts
  const postsCollection = await getBlogSettingsCollection();
  // Get the blog posts collection properly
  const { getBlogPostsCollection } = await import("~/utils/db.server");
  const blogPostsCollection = await getBlogPostsCollection();
  const postsCount = await blogPostsCollection.countDocuments();

  return json({
    settings,
    tours: tours.map((tour) => ({
      slug: tour.slug,
      name: tour.tourName?.es || tour.tourName?.en || tour.slug,
    })),
    diagnostic: {
      isLocked,
      isOverdue,
      lockedUntil: settings.lockedUntil,
      nextRunAt: settings.nextRunAt,
      lastRunAt: settings.lastRunAt,
      lastError: settings.lastError,
      postsCount,
      activeToursCount: tours.length,
      hasGoogleAIKey: !!process.env.GOOGLE_AI_API_KEY,
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdminSession(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "save");

  // Force run - bypasses schedule and clears any lock
  if (intent === "force-run") {
    const collection = await getBlogSettingsCollection();
    
    // Clear any existing lock
    await collection.updateOne(
      { key: "default" },
      { $unset: { lockedUntil: "" } }
    );
    
    const settings = await getBlogSettings();
    const now = new Date();
    
    try {
      const post = await generateBlogPostFromSettings(settings);
      const nextRunAt = calculateNextRunAt(settings, now);
      await collection.updateOne(
        { key: "default" },
        {
          $set: {
            lastRunAt: now,
            nextRunAt,
            updatedAt: new Date(),
          },
          $unset: {
            lastError: "",
            lockedUntil: "",
          },
        }
      );
      return json({ success: true, generated: true, slug: post.slug, message: "Post generado correctamente" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await collection.updateOne(
        { key: "default" },
        {
          $set: {
            lastError: message,
            updatedAt: new Date(),
          },
          $unset: {
            lockedUntil: "",
          },
        }
      );
      return json({ success: false, error: message }, { status: 500 });
    }
  }

  // Clear lock only - doesn't generate a post
  if (intent === "clear-lock") {
    const collection = await getBlogSettingsCollection();
    await collection.updateOne(
      { key: "default" },
      { $unset: { lockedUntil: "" } }
    );
    return json({ success: true, message: "Lock cleared successfully" });
  }

  // Reset scheduler - clears lock and resets nextRunAt to now
  if (intent === "reset-scheduler") {
    const collection = await getBlogSettingsCollection();
    const settings = await getBlogSettings();
    const now = new Date();
    const nextRunAt = calculateNextRunAt(settings, now);
    
    await collection.updateOne(
      { key: "default" },
      {
        $set: {
          nextRunAt,
          updatedAt: new Date(),
        },
        $unset: {
          lockedUntil: "",
          lastError: "",
        },
      }
    );
    return json({ success: true, message: "Scheduler reset successfully" });
  }

  if (intent === "generate-status") {
    const jobId = String(formData.get("jobId") || "");
    if (!jobId) {
      return json({ success: false, error: "Job ID is required" }, { status: 400 });
    }

    const job = blogGenerationJobs.get(jobId);
    if (!job) {
      return json({ success: false, error: "Job not found" }, { status: 404 });
    }

    return json({
      success: true,
      jobId,
      status: job.status,
      message: job.message,
      slug: job.slug,
      error: job.error,
    });
  }

  if (intent === "generate") {
    console.log("[BLOG-ACTION] Received generate intent, background:", formData.get("background"));
    const settings = await getBlogSettings();
    const background = formData.get("background");

    if (background === "true") {
      console.log("[BLOG-ACTION] Starting background job");
      const jobId = startBlogGenerationJob(settings);
      return json({
        success: true,
        jobId,
        status: "processing",
        message: "Generación iniciada en segundo plano",
      });
    }

    const now = new Date();
    const collection = await getBlogSettingsCollection();
    try {
      const post = await generateBlogPostFromSettings(settings);
      const nextRunAt = calculateNextRunAt(settings, now);
      await collection.updateOne(
        { key: "default" },
        {
          $set: {
            lastRunAt: now,
            nextRunAt,
            updatedAt: new Date(),
          },
          $unset: {
            lastError: "",
          },
        }
      );
      return json({ success: true, generated: true, slug: post.slug });
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
  const useCustomPrompt = formData.get("useCustomPrompt") === "true";
  const customPrompt = String(formData.get("customPrompt") || "");

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
    useCustomPrompt,
    customPrompt,
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

type GenerateActionResponse = {
  success?: boolean;
  generated?: boolean;
  slug?: string;
  status?: "pending" | "processing" | "completed" | "failed";
  message?: string;
  jobId?: string;
  error?: string;
};

export default function AdminBlogSettingsRoute() {
  const { settings, tours, diagnostic } = useLoaderData<typeof loader>();
  const [frequency, setFrequency] = useState(settings.frequency);
  const [publishHour, setPublishHour] = useState(String(settings.publishHour));
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>(settings.selectedWeekdays || [3]);
  const [tone, setTone] = useState(settings.tone);
  const [includeSeoKeywords, setIncludeSeoKeywords] = useState(settings.includeSeoKeywords);
  const [selectAllTours, setSelectAllTours] = useState(settings.selectAllTours);
  const [monthlyCount, setMonthlyCount] = useState(String(settings.monthlyCount));
  const [wordRange, setWordRange] = useState(`${settings.wordCountMin}-${settings.wordCountMax}`);
  const [paragraphRange, setParagraphRange] = useState(`${settings.paragraphsMin}-${settings.paragraphsMax}`);
  const generateFetcher = useFetcher<typeof action>();
  const navigate = useNavigate();
  const [useCustomPrompt, setUseCustomPrompt] = useState(settings.useCustomPrompt ?? false);
  const [customPrompt, setCustomPrompt] = useState(settings.customPrompt ?? "");
  const [showSuccess, setShowSuccess] = useState(false);
  const [generationJobId, setGenerationJobId] = useState<string | null>(null);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [completedSlug, setCompletedSlug] = useState<string | null>(null);

  // Only check generationJobId for the loading state - don't rely on fetcher.state
  // because the fetcher returns immediately with a jobId while the job runs in background
  const isGenerating = Boolean(generationJobId);

  useEffect(() => {
    const data = generateFetcher.data as GenerateActionResponse | undefined;
    if (!data) {
      return;
    }

    if (data.success === false) {
      setGenerationError(data.error || "Error al generar el post");
      setGenerationMessage(null);
      setGenerationJobId(null);
      toast.error(data.error || "Error al generar el post");
      return;
    }

    setGenerationError(null);

    if (typeof data.jobId === "string" && data.jobId) {
      setGenerationJobId(data.jobId);
      setGenerationMessage(data.message || "Generación iniciada en segundo plano");
      return;
    }

    if (data.generated && typeof data.slug === "string") {
      setCompletedSlug(data.slug);
      // Show success message if provided (from force-run)
      if (data.message) {
        setGenerationMessage(data.message);
      }
      toast.success("Blog generado y publicado correctamente");
    }
  }, [generateFetcher.data]);

  useEffect(() => {
    if (!generationJobId) {
      return;
    }

    let isCancelled = false;
    let timeoutId: number | undefined;
    let retries = 0;

    const pollGenerationStatus = async () => {
      if (isCancelled) {
        return;
      }

      try {
        const statusFormData = new FormData();
        statusFormData.append("intent", "generate-status");
        statusFormData.append("jobId", generationJobId);

        const response = await fetch("/admin/dashboard/blog?index", {
          method: "POST",
          body: statusFormData,
          credentials: "same-origin",
        });

        console.log("[BLOG-POLL] Response status:", response.status);
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          console.error("[BLOG-POLL] Non-JSON response:", contentType);
          throw new Error("La sesión expiró o el servidor respondió de forma inesperada.");
        }

        const data = await response.json() as GenerateActionResponse;
        console.log("[BLOG-POLL] Response data:", data);
        if (!response.ok || data.success === false) {
          throw new Error(data.error || "No se pudo verificar el estado de generación.");
        }

        retries = 0;

        if (data.status === "completed") {
          setGenerationJobId(null);
          setGenerationMessage(null);
          toast.success("Blog generado y publicado correctamente");

          if (typeof data.slug === "string" && data.slug) {
            setCompletedSlug(data.slug);
            return;
          }

          setGenerationError("El post se generó pero no devolvió un slug válido.");
          return;
        }

        if (data.status === "failed") {
          setGenerationJobId(null);
          setGenerationMessage(null);
          setGenerationError(data.error || data.message || "Error al generar el post.");
          toast.error(data.error || "Error al generar el blog");
          return;
        }

        setGenerationMessage(data.message || "Generando post del blog...");
        timeoutId = window.setTimeout(pollGenerationStatus, 3000);
      } catch (error) {
        retries += 1;

        if (retries <= 5) {
          setGenerationMessage("Reconectando con el servidor...");
          timeoutId = window.setTimeout(pollGenerationStatus, 5000);
          return;
        }

        setGenerationJobId(null);
        setGenerationMessage(null);
        setGenerationError(
          error instanceof Error
            ? error.message
            : "No se pudo verificar el estado de generación.",
        );
      }
    };

    pollGenerationStatus();

    return () => {
      isCancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [generationJobId]);

  useEffect(() => {
    if (completedSlug) {
      setShowSuccess(true);
      const timeout = window.setTimeout(() => {
        navigate(`/admin/dashboard/blog/posts/${completedSlug}`);
      }, 5000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [completedSlug, navigate]);

  const handleGenerateNow = () => {
    console.log("[BLOG] handleGenerateNow called");
    setShowSuccess(false);
    setCompletedSlug(null);
    setGenerationError(null);
    setGenerationMessage("Iniciando generación...");
    console.log("[BLOG] Submitting generateFetcher with intent=generate");

    generateFetcher.submit(
      { intent: "generate", background: "true" },
      { method: "post" },
    );
  };

  // Debug fetcher state changes
  console.log("[BLOG] Fetcher state:", generateFetcher.state, "data:", generateFetcher.data);

  return (
    <div className="relative">
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-gray-700">{generationMessage || "Generando post del blog..."}</p>
          </div>
        </div>
      )}

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Configuración del Blog</CardTitle>
          <CardDescription>Controla la frecuencia y parámetros de generación automática.</CardDescription>
        </CardHeader>
        <CardContent>
          {showSuccess && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Post generado correctamente. Te redirigimos al editor en 5 segundos.
            </div>
          )}
          {generationError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {generationError}
            </div>
          )}
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
            <input type="hidden" name="useCustomPrompt" value={useCustomPrompt ? "true" : "false"} />
            <input type="hidden" name="customPrompt" value={customPrompt} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Frecuencia</Label>
                <Select value={frequency} onValueChange={(value) => setFrequency(value as typeof frequency)}>
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
                <Select value={tone} onValueChange={(value) => setTone(value as typeof tone)}>
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

              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label>Usar prompt personalizado</Label>
                  <p className="text-sm text-gray-500">Añadir un enfoque o tema específico que la IA priorizará.</p>
                </div>
                <Switch checked={useCustomPrompt} onCheckedChange={setUseCustomPrompt} />
              </div>
            </div>

            {useCustomPrompt && (
              <div className="space-y-2">
                <Label>Prompt personalizado</Label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ej: Enfócate en la gastronomía valenciana y menciona restaurantes típicos del centro histórico..."
                  rows={4}
                  className="resize-y"
                />
                <p className="text-xs text-gray-500">
                  Este texto se añadirá como enfoque prioritario al generar el artículo.
                </p>
              </div>
            )}

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
                <Button
                  type="button"
                  variant="outline"
                  disabled={isGenerating}
                  onClick={handleGenerateNow}
                >
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
