import { json, Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import Nav from "./components/layout/nav";
import "./tailwind.css";

import { useLoaderData, useLocation } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { getCookie, setCookieHeader } from "~/utils/cookies";
import { NavType, NavData } from "~/data/nav";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  let currentLanguage = getCookie(cookieHeader, "language");
  let flag;

  // Detect language if the cookie is not set
  if (!currentLanguage) {
    const acceptLanguage = request.headers.get("Accept-Language") || "es";
    if (acceptLanguage.startsWith("ru")) {
      currentLanguage = "russian";
    } else if (acceptLanguage.startsWith("en")) {
      currentLanguage = "english";
    } else if (acceptLanguage.startsWith("de")) {
      currentLanguage = "german";
    } else if (acceptLanguage.startsWith("it")) {
      currentLanguage = "italian";
    } else {
      currentLanguage = "spanish"; // Default to Spanish
    }
    const headers = setCookieHeader("language", currentLanguage);
    return json({ navLinks: NavData.find((nav) => nav.language === currentLanguage)?.links || [] }, { headers });
  }

  if ((currentLanguage = "spanish")) {
    flag = "🇪🇸";
  } else if ((currentLanguage = "english")) {
    flag = "🇬🇧";
  } else if ((currentLanguage = "german")) {
    flag = "🇩🇪";
  } else if ((currentLanguage = "italian")) {
    flag = "🇮🇹";
  } else {
    flag = "🇷🇺";
  }
  // Return the navigation links based on the current language
  return json({ navLinks: NavData.find((nav) => nav.language === currentLanguage)?.links || [], currentLanguage, flag });
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Nav />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
