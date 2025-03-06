import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useLocation } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import "./styles/globals.css";
import { json, type LoaderArgs, ActionArgs, redirect } from "@remix-run/node";
import { languageCookie, cookieConsentCookie } from "~/utils/cookies";
import languageData from "~/data/data.json";
import Nav from "~/components/layout/nav";
import Footer from "./components/layout/footer";
import ArrowToTop from "./components/_index/ArrowToTop";
import { LanguageContextProvider } from "~/providers/LanguageContext";
import { MotionProvider } from "~/providers/MotionProvider";
import { CookieConsentProvider } from "~/providers/CookieConsentContext";
import CookieConsent from "~/components/ui/CookieConsent";
import { getAllPages } from "~/utils/page.server";
import { ToastProvider } from "~/components/ui/toast-provider";
import { getToursCollection } from "~/utils/db.server";
import type { Tour } from "~/utils/db.schema.server";

export interface RootLoaderData {
  initialLanguage: typeof languageData.en;
  ENV: {
    STRIPE_PUBLIC_KEY: string | undefined;
    PAYPAL_CLIENT_ID: string | undefined;
  };
  pages: Awaited<ReturnType<typeof getAllPages>>;
  tours: Tour[];
  cookieConsent: boolean | null;
}

export const loader = async ({ request }: LoaderArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookieLanguage = (await languageCookie.parse(cookieHeader)) || "en";
  const language = cookieLanguage as keyof typeof languageData;
  
  // Get cookie consent status
  const cookieConsent = await cookieConsentCookie.parse(cookieHeader);

  const pages = await getAllPages();
  
  // Fetch active tours
  const toursCollection = await getToursCollection();
  const tours = await toursCollection.find({ status: 'active' }).toArray();

  return json<RootLoaderData>({
    initialLanguage: languageData[language] || languageData.en,
    ENV: {
      STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID
    },
    pages,
    tours,
    cookieConsent,
  });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const consent = formData.get("consent");
  
  // Get the current URL to redirect back to
  const url = new URL(request.url);
  const redirectTo = formData.get("redirectTo") || url.pathname;
  
  // Set the cookie based on the consent value
  return redirect(redirectTo as string, {
    headers: {
      "Set-Cookie": await cookieConsentCookie.serialize(consent === "true"),
    },
  });
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
  {
    rel: "apple-touch-icon",
    href: "/apple-touch-icon.png",
  },
  {
    rel: "apple-touch-icon-precomposed",
    href: "/apple-touch-icon-precomposed.png",
  },
  {
    rel: "icon",
    type: "image/x-icon",
    href: "/favicon.ico",
  },
];

export default function App() {
  const { initialLanguage, ENV, pages, cookieConsent } = useLoaderData<RootLoaderData>();
  const location = useLocation();
  const isAdminDashboard = location.pathname.includes("/admin/dashboard");
  const isAdminPage = location.pathname.includes("/admin");

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-background text-foreground">
        <MotionProvider>
          <LanguageContextProvider initialState={initialLanguage}>
            <CookieConsentProvider initialConsent={cookieConsent}>
              <ArrowToTop />
              <Nav pages={pages} />
              <Outlet />
              {!isAdminDashboard && <Footer />}
              {!isAdminPage && <CookieConsent />}
              <ToastProvider />
            </CookieConsentProvider>
          </LanguageContextProvider>
        </MotionProvider>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}
