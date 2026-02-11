export type BlogLanguage = "es" | "en";

type BlogTexts = {
  index: {
    heading: string;
    metaTitle: string;
    metaDescription: string;
  };
  post: {
    notFoundDescription: string;
    readingTimeLabel: string;
    backToBlog: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaButton: string;
    relatedToursTitle: string;
    relatedToursSubtitle: string;
    viewTour: string;
    allArticles: string;
  };
};

const BLOG_TEXTS: Record<BlogLanguage, BlogTexts> = {
  es: {
    index: {
      heading: "Blog",
      metaTitle: "Blog | Tour To Valencia",
      metaDescription: "Inspiracion, excursiones y cosas que hacer en Valencia con enfoque en nuestras experiencias.",
    },
    post: {
      notFoundDescription: "Post no encontrado.",
      readingTimeLabel: "de lectura",
      backToBlog: "Volver al Blog",
      ctaTitle: "Listo para explorar Valencia?",
      ctaDescription: "Descubre experiencias unicas y tours inolvidables con expertos locales.",
      ctaButton: "Ver todos los tours",
      relatedToursTitle: "Tours Relacionados",
      relatedToursSubtitle: "Experiencias mencionadas en este articulo",
      viewTour: "Ver tour",
      allArticles: "Todos los articulos",
    },
  },
  en: {
    index: {
      heading: "Blog",
      metaTitle: "Blog | Tour To Valencia",
      metaDescription: "Inspiration, travel ideas, and things to do in Valencia with a focus on our experiences.",
    },
    post: {
      notFoundDescription: "Post not found.",
      readingTimeLabel: "read",
      backToBlog: "Back to Blog",
      ctaTitle: "Ready to explore Valencia?",
      ctaDescription: "Discover unique experiences and unforgettable tours with local experts.",
      ctaButton: "View all tours",
      relatedToursTitle: "Related Tours",
      relatedToursSubtitle: "Experiences mentioned in this article",
      viewTour: "View tour",
      allArticles: "All articles",
    },
  },
};

export function getBlogTexts(language: BlogLanguage): BlogTexts {
  return BLOG_TEXTS[language] || BLOG_TEXTS.es;
}

export function resolveBlogLanguage(currentLanguage: string | undefined, fallback: BlogLanguage = "es"): BlogLanguage {
  if (!currentLanguage) return fallback;

  const normalized = currentLanguage.trim().toLowerCase();
  if (normalized === "en" || normalized === "english") return "en";
  if (normalized === "es" || normalized === "espanol" || normalized === "español") return "es";
  return fallback;
}
