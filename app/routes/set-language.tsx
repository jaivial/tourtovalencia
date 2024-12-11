// app/routes/set-language.tsx

import { ActionFunction, json } from "@remix-run/node";
import { languageCookie } from "~/utils/cookies";

export const action: ActionFunction = async ({ request }) => {
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
