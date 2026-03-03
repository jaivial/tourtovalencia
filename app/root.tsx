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
import type { Tour } from "~/utils/db.schema.server";

// Global error handler - supresses SSR hydration errors from heroui/theme
if (typeof window !== 'undefined') {
  // Add shims for CJS modules that might be loaded
  if (!window.module) {
    (window as any).module = { exports: {}, require: () => (window as any).module?.exports || {} };
  }
  if (!window.require) {
    (window as any).require = () => (window as any).module?.exports || {};
  }

  const originalOnerror = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    // Ignore require/module errors from CJS compatibility issues
    if (typeof message === 'string' && (message.includes('require is not defined') || message.includes('module is not defined'))) {
      return true; // Suppress the error
    }
    // Ignore Suspense hydration errors - React handles these automatically by switching to client rendering
    if (typeof message === 'string' && message.includes('Suspense boundary received an update before it finished hydrating')) {
      return true; // Suppress the error - React handles this gracefully
    }
    if (originalOnerror) {
      return originalOnerror(message, source, lineno, colno, error);
    }
    console.error('[GLOBAL ERROR]', message, error);
    // Force hide loading on error
    setTimeout(() => {
      const loadingElement = document.querySelector('[class*="bg-gray-900"]');
      if (loadingElement && loadingElement instanceof HTMLElement) {
        loadingElement.style.display = 'none';
      }
    }, 100);
  };
}

// Define the handle type for routes
interface RouteHandle {
  skipLayout?: boolean;
  [key: string]: unknown; // Using unknown instead of any
}

export interface RootLoaderData {
  initialLanguage: typeof languageData.en;
  pages: Awaited<ReturnType<typeof getAllPages>>;
  tours: Tour[];
  cookieConsent: boolean | null;
}

export const loader = async ({ request }: { request: Request }) => {
  const loaderStartTime = Date.now();
  console.log(`[ROOT LOADER] Starting loader for root - ${new Date(loaderStartTime).toISOString()}`);
  
  const cookieHeader = request.headers.get("Cookie");
  const cookieLanguage = (await languageCookie.parse(cookieHeader)) || "en";
  const language = cookieLanguage as keyof typeof languageData;

  // Get cookie consent status
  const cookieConsent = await cookieConsentCookie.parse(cookieHeader);

  const pagesStart = Date.now();
  const pages = await getAllPages();
  console.log(`[ROOT LOADER] Fetched pages in ${Date.now() - pagesStart}ms`);

  // Fetch active tours
  const toursStart = Date.now();
  const toursCollection = await getToursCollection();
  const tours = await toursCollection.find({ status: 'active' }).toArray();
  console.log(`[ROOT LOADER] Fetched ${tours.length} tours in ${Date.now() - toursStart}ms`);
  
  console.log(`[ROOT LOADER] Total loader time: ${Date.now() - loaderStartTime}ms`);

  return json<RootLoaderData>({
    initialLanguage: languageData[language] || languageData.en,
    pages,
    tours,
    cookieConsent,
  });
};

const ALLOWED_REDIRECTS = [
  '/',
  '/book',
  '/blog',
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
    href: "https://tourtovalencia.b-cdn.net/public/newtourtovalencialogo.png",
  },
  {
    rel: "icon",
    type: "image/png",
    href: "https://tourtovalencia.b-cdn.net/public/newtourtovalencialogo.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "https://tourtovalencia.b-cdn.net/public/newtourtovalencialogo.png",
  },
  {
    rel: "manifest",
    href: "/manifest.json",
  },
];

export default function App() {
  const { initialLanguage, pages, cookieConsent } = useLoaderData<RootLoaderData>();
  const location = useLocation();
  const matches = useMatches();

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
          <link rel="icon" type="image/png" href="https://tourtovalencia.b-cdn.net/public/newtourtovalencialogo.png" />
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
        <link rel="shortcut icon" href="https://tourtovalencia.b-cdn.net/public/newtourtovalencialogo.png" />
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
         <Scripts />
       </body>
    </html>
  );
}
