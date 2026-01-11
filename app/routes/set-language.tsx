// app/routes/set-language.tsx

import type { ActionFunctionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { languageCookie } from "~/utils/cookies";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const language = formData.get("language") || "en";

  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": await languageCookie.serialize(language),
      },
    }
  );
};
