import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useLocation } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import "./styles/globals.css";
import { json, type LoaderArgs } from "@remix-run/node";
import { languageCookie } from "~/utils/cookies";
import languageData from "~/data/data.json";
import Nav from "~/components/layout/nav";
import Footer from "./components/layout/footer";
import ArrowToTop from "./components/_index/ArrowToTop";
import { LanguageContextProvider } from "~/providers/LanguageContext";
import { MotionProvider } from "~/providers/MotionProvider";
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
}

export const loader = async ({ request }: LoaderArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookieLanguage = (await languageCookie.parse(cookieHeader)) || "en";
  const language = cookieLanguage as keyof typeof languageData;

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
  const { initialLanguage, ENV, pages, tours } = useLoaderData<RootLoaderData>();
  const location = useLocation();
  const isAdminDashboard = location.pathname.includes("/admin/dashboard");

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
            <ArrowToTop />
            <Nav pages={pages} />
            <Outlet />
            {!isAdminDashboard && <Footer />}
            <ToastProvider />
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
