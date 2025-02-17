import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation, useLoaderData } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import "./tailwind.css";
import { LoaderFunction } from "@remix-run/node";
import { languageCookie } from "~/utils/cookies";
import { languages } from "~/data/data";
import { json } from "@remix-run/react";
import Nav from "~/components/layout/nav";
import Footer from "./components/layout/footer";
import ArrowToTop from "./components/_index/ArrowToTop";
import { LanguageContextProvider } from "~/providers/LanguageContext";
import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeScript } from "@chakra-ui/color-mode";
import theme from "~/theme";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookieLanguage = (await languageCookie.parse(cookieHeader)) || "en";

  return json({ initialLanguage: languages[cookieLanguage] || languages.en });
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

export default function App() {
  const { initialLanguage } = useLoaderData<typeof loader>();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin-');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ChakraProvider theme={theme}>
          <LanguageContextProvider initialState={initialLanguage}>
            <ArrowToTop />
            {!isAdminRoute && <Nav />}
            <Outlet />
            {!isAdminRoute && <Footer />}
          </LanguageContextProvider>
        </ChakraProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
