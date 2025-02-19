import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useLocation } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import "./styles/globals.css";
import { LoaderFunction } from "@remix-run/node";
import { languageCookie } from "~/utils/cookies";
import { languages } from "~/data/data";
import { json } from "@remix-run/node";
import Nav from "~/components/layout/nav";
import Footer from "./components/layout/footer";
import ArrowToTop from "./components/_index/ArrowToTop";
import { LanguageContextProvider } from "~/providers/LanguageContext";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookieLanguage = (await languageCookie.parse(cookieHeader)) || "en";

  return json({ 
    initialLanguage: languages[cookieLanguage] || languages.en,
    ENV: {
      STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    }
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
  const { initialLanguage, ENV } = useLoaderData<typeof loader>();
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
        <LanguageContextProvider initialState={initialLanguage}>
          <ArrowToTop />
          <Nav />
          <Outlet />
          {!isAdminDashboard && <Footer />}
        </LanguageContextProvider>
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
