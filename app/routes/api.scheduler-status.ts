import { json } from "@remix-run/server-runtime";
import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { getBlogSettings } from "~/models/blogSettings.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const settings = await getBlogSettings();
    
    const now = new Date();
    const isLocked = settings.lockedUntil ? settings.lockedUntil > now : false;
    const isOverdue = settings.nextRunAt ? settings.nextRunAt <= now : true;
    
    return json({
      success: true,
      scheduler: {
        nextRunAt: settings.nextRunAt,
        lastRunAt: settings.lastRunAt,
        lastError: settings.lastError,
        lockedUntil: settings.lockedUntil,
        isLocked,
        isOverdue,
        frequency: settings.frequency,
        publishHour: settings.publishHour,
        selectedWeekdays: settings.selectedWeekdays,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
