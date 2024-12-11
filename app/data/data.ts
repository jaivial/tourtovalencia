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
export type IndexSection2Type = {
  firstH3: string;
  secondH3: string;
  thirdH3: string;
};
export type IndexSection4Type = {
  firstH3: string;
  spanH3: string;
  secondH3: string;
};
export type IndexSection5Type = {
  firstH3: string;
  secondH3: string;
  thirdH3: string;
  fourthH3: string;
  fifthH3: string;
};

export type Index = {
  heroSection: HeroSectionType;
  indexSection1: IndexSection1Type;
  indexSection2: IndexSection2Type;
  indexSection4: IndexSection4Type;
  indexSection5: IndexSection5Type;
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
      indexSection2: {
        firstH3: "Enjoy a relaxing boat ride through one of the most spectacular underground rivers!",
        secondH3: "You'll travel 800 meters by boat.",
        thirdH3: "Did you know it's the longest navigable underground river in Europe?",
      },
      indexSection4: {
        firstH3: "PRIVATE GUIDED TOUR",
        spanH3: "Maximum 4 people",
        secondH3: "The experience is located in the province of Castellón, an area where I've lived since childhood and enjoy whenever I can.",
      },
      indexSection5: {
        firstH3: "DEPARTURE FROM VALENCIA",
        secondH3: "Departure from Plaza de La Reina, Valencia.",
        thirdH3: "Private transport to La Vall d'Uixó (Castellón).",
        fourthH3: "Guided tour: 3h 30m (approx).",
        fifthH3: "Return to Valencia by private transport.",
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
      indexSection2: {
        firstH3: "¡Disfruta de un relajante paseo en barca por uno de los ríos subterráneos más espectaculares!",
        secondH3: "Recorrerás 800 metros en barca.",
        thirdH3: "¿Sabías que es el río subterráneo navegable más largo de Europa?",
      },
      indexSection4: {
        firstH3: "VISITA GUIADA PRIVADA",
        spanH3: "Máximo 4 personas",
        secondH3: "La experiencia está ubicada en la provincia de Castellón, zona donde he vivido desde mi infancia y disfruto siempre que puedo.",
      },
      indexSection5: {
        firstH3: "SALIDA DESDE VALENCIA",
        secondH3: "Salida desde Plaza de La Reina, Valencia.",
        thirdH3: "Viaje en transporte privado hasta La Vall D'Uixo (Castellón).",
        fourthH3: "Visita guiada 3h 30m (aprox).",
        fifthH3: "Vuelta a Valencia en en transporte privado.",
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
      indexSection2: {
        firstH3: "Profite d'une balade relaxante en barque sur l'une des rivières souterraines les plus spectaculaires!",
        secondH3: "Tu parcourras 800 mètres en barque.",
        thirdH3: "Savais-tu que c'est la plus longue rivière souterraine navigable d'Europe?",
      },
      indexSection4: {
        firstH3: "VISITE GUIDÉE PRIVÉE",
        spanH3: "Maximum 4 personnes",
        secondH3: "L'expérience se situe dans la province de Castellón, une région où je vis depuis mon enfance et que je savoure dès que possible.",
      },
      indexSection5: {
        firstH3: "DÉPART DE VALENCE",
        secondH3: "Départ depuis la Plaza de La Reina, Valence.",
        thirdH3: "Transport privé jusqu'à La Vall d'Uixó (Castellón).",
        fourthH3: "Visite guidée : 3h 30min (env.).",
        fifthH3: "Retour à Valence en transport privé.",
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
      indexSection2: {
        firstH3: "Насладись расслабляющей прогулкой на лодке по одному из самых впечатляющих подземных рек!",
        secondH3: "Ты проплывёшь 800 метров на лодке.",
        thirdH3: "Знал ли ты, что это самая длинная судоходная подземная река в Европе?",
      },
      indexSection4: {
        firstH3: "ЧАСТНАЯ ЭКСКУРСИЯ С ГИДОМ",
        spanH3: "Максимум 4 человека",
        secondH3: "Экскурсия проходит в провинции Кастельон, где я живу с детства и наслаждаюсь, когда могу.",
      },
      indexSection5: {
        firstH3: "ОТПРАВЛЕНИЕ ИЗ ВАЛЕНСИИ",
        secondH3: "Отправление с Пласа-де-ла-Рейна, Валенсия.",
        thirdH3: "Поездка на частном транспорте до Ла-Валь-д’Ушо (Кастельон).",
        fourthH3: "Экскурсия с гидом: 3 ч 30 мин (примерно).",
        fifthH3: "Возвращение в Валенсию на частном транспорте.",
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
      indexSection2: {
        firstH3: "Genieße eine entspannte Bootsfahrt durch einen der spektakulärsten unterirdischen Flüsse!",
        secondH3: "Du fährst 800 Meter mit dem Boot.",
        thirdH3: "Wusstest du, dass es der längste schiffbare unterirdische Fluss Europas ist?",
      },
      indexSection4: {
        firstH3: "PRIVATE FÜHRUNG",
        spanH3: "Maximal 4 Personen",
        secondH3: "Das Erlebnis befindet sich in der Provinz Castellón, wo ich seit meiner Kindheit lebe und es immer genieße, wenn ich kann.",
      },
      indexSection5: {
        firstH3: "ABFAHRT VON VALENCIA",
        secondH3: "Abfahrt von der Plaza de La Reina, Valencia.",
        thirdH3: "Privattransport nach La Vall d'Uixó (Castellón).",
        fourthH3: "Geführte Tour: 3 Std. 30 Min. (ca.).",
        fifthH3: "Rückfahrt nach Valencia mit Privattransport.",
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
      indexSection2: {
        firstH3: "Goditi un rilassante giro in barca lungo uno dei fiumi sotterranei più spettacolari!",
        secondH3: "Percorrerai 800 metri in barca.",
        thirdH3: "Sapevi che è il fiume sotterraneo navigabile più lungo d'Europa?",
      },
      indexSection4: {
        firstH3: "VISITA GUIDATA PRIVATA",
        spanH3: "Massimo 4 persone",
        secondH3: "L'esperienza si trova nella provincia di Castellón, una zona dove vivo fin dall'infanzia e di cui godo ogni volta che posso.",
      },
      indexSection5: {
        firstH3: "PARTENZA DA VALENCIA",
        secondH3: "Partenza da Plaza de La Reina, Valencia.",
        thirdH3: "Trasporto privato fino a La Vall d'Uixó (Castellón).",
        fourthH3: "Visita guidata: 3h 30m (circa).",
        fifthH3: "Ritorno a Valencia con trasporto privato.",
      },
    },
  },
};
