// app/data.ts

export type Link = {
  path: string;
  linkText: string;
};

export type HeroSectionType = {
  firstH2Orange: string;
  firstH2: string;
  firstH3: string;
  secondH3: string;
};

export type Index = {
  heroSection: HeroSectionType;
};

export type LanguageData = {
  links: Link[];
  flag: string;
  currentLanguage: string;
  index: Index;
};
export const languages: Record<string, LanguageData> = {
  en: {
    links: [
      { path: "/", linkText: "Home" },
      { path: "/about", linkText: "About" },
    ],
    flag: "🇺🇸",
    currentLanguage: "English",
    index: {
      heroSection: {
        firstH2Orange: "SAN JUAN",
        firstH2: "CAVES",
        firstH3: "BOAT TRIP AND EXCURSION",
        secondH3: "FROM VALENCIA",
      },
    },
  },
  es: {
    links: [
      { path: "/", linkText: "Inicio" },
      { path: "/about", linkText: "Acerca de" },
    ],
    flag: "🇪🇸",
    currentLanguage: "Español",
    index: {
      heroSection: {
        firstH2Orange: "CUEVAS",
        firstH2: "DE SAN JUAN",
        firstH3: "EXCURSIÓN Y VIAJE EN BARCA",
        secondH3: "DESDE VALENCIA",
      },
    },
  },
  fr: {
    links: [
      { path: "/", linkText: "Accueil" },
      { path: "/about", linkText: "À propos" },
    ],
    flag: "🇫🇷",
    currentLanguage: "Français",
    index: {
      heroSection: {
        firstH2Orange: "GROTTES",
        firstH2: "DE SAN JUAN",
        firstH3: "EXCURSION ET PROMENADE EN BATEAU",
        secondH3: "DEPUIS VALENCE",
      },
    },
  },
  ru: {
    links: [
      { path: "/", linkText: "Домой" },
      { path: "/about", linkText: "О нас" },
    ],
    flag: "🇷🇺",
    currentLanguage: "Русский",
    index: {
      heroSection: {
        firstH2Orange: "ПЕЩЕРЫ",
        firstH2: "САН-ХУАНА",
        firstH3: "ЭКСКУРСИЯ И ПРОГУЛКА НА ЛОДКЕ",
        secondH3: "ИЗ ВАЛЕНСИИ",
      },
    },
  },
  de: {
    links: [
      { path: "/", linkText: "Startseite" },
      { path: "/about", linkText: "Über uns" },
    ],
    flag: "🇩🇪",
    currentLanguage: "Deutsch",
    index: {
      heroSection: {
        firstH2Orange: "HÖHLEN",
        firstH2: "VON SAN JUAN",
        firstH3: "AUSFLUG UND BOOTSFAHRT",
        secondH3: "VON VALENCIA",
      },
    },
  },
  it: {
    links: [
      { path: "/", linkText: "Home" },
      { path: "/about", linkText: "Chi siamo" },
    ],
    flag: "🇮🇹",
    currentLanguage: "Italiano",
    index: {
      heroSection: {
        firstH2Orange: "GROTTE",
        firstH2: "DI SAN JUAN",
        firstH3: "ESCURSIONE E GIRO IN BARCA",
        secondH3: "DA VALENCIA",
      },
    },
  },
};
