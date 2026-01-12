import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useLocation, useMatches } from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";
import "./styles/globals.css";
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
import LoadingScreen from "~/components/ui/LoadingScreen";
import type { Tour } from "~/utils/db.schema.server";
import { useState, useEffect } from "react";

// Define the handle type for routes
interface RouteHandle {
  skipLayout?: boolean;
  [key: string]: unknown; // Using unknown instead of any
}

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

export const loader = async ({ request }: { request: Request }) => {
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

const ALLOWED_REDIRECTS = [
  '/',
  '/book',
  '/sanjuan',
  '/valencia-things-to-do',
  '/pages',
];

function isValidRedirect(url: string, origin: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== origin) {
      return false;
    }
    return ALLOWED_REDIRECTS.includes(parsed.pathname);
  } catch {
    return false;
  }
}

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const consent = formData.get("consent");
  
  const url = new URL(request.url);
  const origin = url.origin;
  let redirectTo = formData.get("redirectTo") || url.pathname;
  
  if (!isValidRedirect(redirectTo as string, origin)) {
    redirectTo = "/";
  }
  
  return redirect(redirectTo as string, {
    headers: {
      "Set-Cookie": await cookieConsentCookie.serialize(consent === "true"),
    },
  });
};

export const links = () => [
  {
    rel: "shortcut icon",
    href: "/favicon.ico",
  },
  {
    rel: "icon",
    type: "image/x-icon",
    href: "https://tourtovalencia.com/favicon.ico",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/favicon.png",
  },
  {
    rel: "manifest",
    href: "/manifest.json",
  },
];

export default function App() {
  const { initialLanguage, ENV, pages, cookieConsent } = useLoaderData<RootLoaderData>();
  const location = useLocation();
  const matches = useMatches();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  
  const [hasLoaded, setHasLoaded] = useState(false);
  
  useEffect(() => {
    if (!hasLoaded) {
      setIsLoading(true);
      const interval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 100));
      }, 100);
      
      setTimeout(() => {
        clearInterval(interval);
        setIsLoading(false);
        setLoadingProgress(100);
        setHasLoaded(true);
      }, 2000);
    }
  }, [hasLoaded]);
  
  // Check if the current route has skipLayout handle
  const skipLayout = matches.some(match => (match.handle as RouteHandle)?.skipLayout);
  
  const isAdminDashboard = location.pathname.includes("/admin/dashboard");
  const isAdminPage = location.pathname.includes("/admin");

  // If skipLayout is true, render a minimal layout
  if (skipLayout) {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <link rel="icon" type="image/x-icon" href="https://tourtovalencia.com/favicon.ico" />
          <meta name="google-site-verification" content="63kEgo-K5QpeD7-YtpQpviW4aSnh6NAEPEsyUMybOec" />


          <Meta />
          <Links />
        </head>
        <body>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  }

  // Regular layout
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="63kEgo-K5QpeD7-YtpQpviW4aSnh6NAEPEsyUMybOec" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-background text-foreground">
         <MotionProvider>
           <LanguageContextProvider initialState={initialLanguage}>
             <CookieConsentProvider initialConsent={cookieConsent}>
               <LoadingScreen progress={loadingProgress} />
               {!isLoading && (
                 <>
                   <ArrowToTop />
                   <Nav pages={pages} />
                   <Outlet />
                   {!isAdminDashboard && <Footer />}
                   {!isAdminPage && <CookieConsent />}
                   <ToastProvider />
                 </>
               )}
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
