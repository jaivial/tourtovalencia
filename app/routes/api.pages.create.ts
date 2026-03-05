import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/server-runtime";
import { createPage } from "~/utils/page.server";
import { requireAdminSession } from "~/utils/admin-session.server";
import { normalizeInfoRequestContact } from "~/utils/whatsapp";

type CreatePageJob = {
  status: "pending" | "processing" | "completed" | "failed";
  message: string;
  error?: string;
  slug?: string;
  startTime: Date;
};

const createPageJobs = new Map<string, CreatePageJob>();

const CREATE_PAGE_JOB_TTL_MS = 60 * 60 * 1000;

function cleanupExpiredCreateJobs() {
  const cutoff = Date.now() - CREATE_PAGE_JOB_TTL_MS;
  for (const [jobId, job] of createPageJobs.entries()) {
    if (job.startTime.getTime() < cutoff) {
      createPageJobs.delete(jobId);
    }
  }
}

function startCreatePageBackgroundJob(
  name: string,
  content: Record<string, unknown>,
  status: "active" | "upcoming",
): string {
  const jobId = `create-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  createPageJobs.set(jobId, {
    status: "pending",
    message: "Job en cola",
    startTime: new Date(),
  });

  setTimeout(async () => {
    try {
      createPageJobs.set(jobId, {
        ...createPageJobs.get(jobId)!,
        status: "processing",
        message: "Procesando contenido e imágenes",
      });

      normalizeTourContent(content);

      const page = await createPage(name, content, status, "tour");

      createPageJobs.set(jobId, {
        ...createPageJobs.get(jobId)!,
        status: "completed",
        message: "Tour creado correctamente",
        slug: page.slug,
      });
    } catch (error) {
      createPageJobs.set(jobId, {
        ...createPageJobs.get(jobId)!,
        status: "failed",
        message: "Error al crear el tour",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      cleanupExpiredCreateJobs();
    }
  }, 0);

  return jobId;
}

function normalizeTourPrice(rawPrice: unknown): number {
  if (typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice >= 0) {
    return rawPrice;
  }

  if (typeof rawPrice === "string") {
    const parsed = Number.parseFloat(rawPrice);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  return 0;
}

function normalizeHasPrice(rawHasPrice: unknown): boolean {
  if (typeof rawHasPrice === "boolean") {
    return rawHasPrice;
  }

  return true;
}

function normalizeTourContent(content: Record<string, unknown>) {
  const normalizedPrice = normalizeTourPrice(content.price);
  const normalizedHasPrice = normalizeHasPrice(content.hasPrice);

  content.hasPrice = normalizedHasPrice;
  content.price = normalizedHasPrice ? normalizedPrice : 0;
  content.infoRequestContact = normalizeInfoRequestContact(content.infoRequestContact);

  return {
    normalizedHasPrice,
  };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminSession(request);

  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId");

  if (!jobId) {
    return json({ error: "Job ID is required" }, { status: 400 });
  }

  const job = createPageJobs.get(jobId);
  if (!job) {
    return json({ error: "Job not found" }, { status: 404 });
  }

  return json({
    jobId,
    status: job.status,
    message: job.message,
    slug: job.slug,
    error: job.error,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  await requireAdminSession(request);

  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const contentStr = formData.get("content");
    const status = formData.get("status");
    const background = formData.get("background");

    if (!name || typeof name !== "string") {
      return json({ error: "Name is required" }, { status: 400 });
    }

    if (!contentStr || typeof contentStr !== "string") {
      return json({ error: "Content is required" }, { status: 400 });
    }

    if (!status || (status !== "active" && status !== "upcoming")) {
      return json({ error: "Status must be either 'active' or 'upcoming'" }, { status: 400 });
    }

    let content: Record<string, unknown>;
    try {
      content = JSON.parse(contentStr) as Record<string, unknown>;
    } catch (parseError) {
      console.error("Error parsing create page content:", parseError);
      return json({ error: "Invalid content format: Unable to parse JSON" }, { status: 400 });
    }
    
    // Debug image data
    console.log("Creating page with name:", name);
    console.log("Status:", status);
    
    if (background === "true") {
      const jobId = startCreatePageBackgroundJob(
        name,
        content,
        status as "active" | "upcoming",
      );

      return json({
        success: true,
        message: "Page creation started in background",
        jobId,
        status: "processing",
      });
    }

    // This endpoint is used by the tour page generator.
    // Always mark the page as a tour and keep the price normalized.
    const { normalizedHasPrice } = normalizeTourContent(content);
    const template = "tour";
    console.log(`Creating page "${name}" as a tour with price ${content.price}€ (hasPrice=${normalizedHasPrice})`);

    // Create page with the content (images are already base64)
    const page = await createPage(name, content, status as "active" | "upcoming", template);

    return json({ success: true, page });
  } catch (error) {
    console.error("Error creating page:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to create page" },
      { status: 500 }
    );
  }
};
