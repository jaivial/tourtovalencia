// Page component: just responsible for containing providers, feature components and fectch data from the ssr.
import type { MetaFunction } from "@remix-run/node";
import IndexContainer from "~/components/_index/IndexContainer";

export const meta: MetaFunction = () => {
  return [
    { title: "Excursiones Mediterráneo | Viajes y Visitas Guiadas en Valencia" },
    { name: "description", content: "Disfruta de excursiones, viajes y visitas guiadas en Valencia para tus vacaciones. Excursiones disponibles: viaje desde Valencia a las Cuevas de San Juan con visita guiada y paseo en barca." },
    { name: "keywords", content: "excursiones mediterráneo, viajes valencia, visitas guiadas valencia, cuevas de san juan, paseo en barca, vacaciones valencia" },
    { name: "author", content: "Excursiones Mediterrámeo" },
    { name: "robots", content: "index, follow" }, // Allows search engines to index and follow links on the page

    // Open Graph (OG) tags for social media sharing (including WhatsApp)
    { property: "og:title", content: "Excursiones Mediterráneo | Viajes y Visitas Guiadas en Valencia" },
    { property: "og:description", content: "Disfruta de excursiones, viajes y visitas guiadas en Valencia para tus vacaciones. Excursiones disponibles: viaje desde Valencia a las Cuevas de San Juan con visita guiada y paseo en barca." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.excursionesmediterraneo.com/" },
    { property: "og:image", content: "/logonuevoolga3.png" },
    { property: "og:image:width", content: "1200" }, // Recommended image width for WhatsApp
    { property: "og:image:height", content: "630" }, // Recommended image height for WhatsApp
    { property: "og:image:alt", content: "Excursión a las Cuevas de San Juan, salida desde Valencia" },

    // Twitter Card tags for better presentation on Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Excursiones Mediterráneo | Viajes y Visitas Guiadas en Valencia" },
    { name: "twitter:description", content: "Disfruta de excursiones, viajes y visitas guiadas en Valencia para tus vacaciones. Excursiones disponibles: viaje desde Valencia a las Cuevas de San Juan con visita guiada y paseo en barca." },
    { name: "twitter:image", content: "/images/logonuevoolga.png" },

    // Additional meta tags for WhatsApp (same as OG tags)
    { property: "og:site_name", content: "Excursiones Mediterráneo" }, // Name of your website
    { property: "og:locale", content: "es_ES" }, // Locale for Spanish language
  ];
};

export default function Index() {
  return <IndexContainer />;
}
