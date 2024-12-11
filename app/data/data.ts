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

export type IndexSection1Type = {
  firstH2: string;
  firstH3: string;
  secondH3: string;
  button: string;
};

export type Index = {
  heroSection: HeroSectionType;
  indexSection1: IndexSection1Type;
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
      indexSection1: {
        firstH2: "EXPLORE VALENCIA",
        firstH3: "Discover Valencia's hidden gems.",
        secondH3: "Adventure is waiting for you.",
        button: "BOOK NOW",
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
      indexSection1: {
        firstH2: "EXPLORA VALENCIA",
        firstH3: "Descubre los rincones secretos de Valencia.",
        secondH3: "La aventura te está esperando.",
        button: "RESERVAR",
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
      indexSection1: {
        firstH2: "EXPLOREZ VALENCE",
        firstH3: "Découvrez les recoins secrets de Valence.",
        secondH3: "L'aventure vous attend.",
        button: "RÉSERVER",
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
      indexSection1: {
        firstH2: "ИССЛЕДУЙТЕ ВАЛЕНСИЮ",
        firstH3: "Откройте для себя тайные уголки Валенсии.",
        secondH3: "Приключение ждет вас.",
        button: "ЗАБРОНИРОВАТЬ",
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
      indexSection1: {
        firstH2: "ENTDECKE VALENCIA",
        firstH3: "Entdecke die geheimen Ecken Valencias.",
        secondH3: "Das Abenteuer wartet auf dich.",
        button: "JETZT BUCHEN",
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
      indexSection1: {
        firstH2: "ESPLORA VALENCIA",
        firstH3: "Scopri gli angoli nascosti di Valencia.",
        secondH3: "L'avventura ti sta aspettando.",
        button: "PRENOTA ORA",
      },
    },
  },
};
