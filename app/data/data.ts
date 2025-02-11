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
  firstH2: string;
  secondH2: string;
};

export type Review = {
  avatar: string; // Avatar image URL or initials
  name: string; // Reviewer's name
  country: string; // Reviewer's country
  date: string; // Review date
  reviewTitle: string;
  reviewText: string; // Review text
  reviewLinkSite: string;
  reviewLink: string;
};

export type IndexSection3Type = {
  firstH3: string;
  firstp: string;
  secondp: string;
  thirdp: string;
  fourthp: string;
};

export type CardProps = {
  title: string;
  mainText: string;
  duration: string;
  price: string;
};

export type IndexSection4Type = {
  firstH3: string;
  propscard: CardProps;
};

export type sanJuansection2Type = {
  firstH3: string;
  secondH3: string;
  thirdH3: string;
};
export type sanJuansection4Type = {
  firstH3: string;
  secondH3: string;
  thirdH3: string;
};
export type sanJuanSection5Type = {
  firstH3: string;
  secondH3: string;
  thirdH3: string;
  fourthH3: string;
  fifthH3: string;
};

export type SanJuanSection6listType = {
  li: string;
  index: number;
};
export type SanJuanSection6Type = {
  cardTitle: string;
  cardDescription: string;
  firstH4: string;
  list: SanJuanSection6listType[];
  secondH4: string;
  secondH4span: string;
  button: string;
};

export type FooterType = {
  firstH4: string;
  firstp: string;
  secondH4: string;
  thirdH4: string;
  firstspan: string;
  firstli: string;
  secondspan: string;
  thirdspan: string;
  privacypolicy: string;
  termsofservice: string;
};

export type Index = {
  heroSection: HeroSectionType;
  indexSection1: IndexSection1Type;
  indexSection2: IndexSection2Type;
  indexSection3: IndexSection3Type;
  carouselIndexSection2: Review[];
  indexSection4: IndexSection4Type;
};

export type SanJuan = {
  sanJuanSection2: sanJuansection2Type;
  sanJuanSection4: sanJuansection4Type;
  sanJuanSection5: sanJuanSection5Type;
  sanJuanSection6: SanJuanSection6Type;
};

export type LanguageData = {
  links: Link[];
  flag: string;
  currentLanguage: string;
  index: Index;
  sanjuan: SanJuan;
  footer: FooterType;
};
export const languages: Record<string, LanguageData> = {
  en: {
    links: [
      { path: "/", linkText: "Home" },
      { path: "/about", linkText: "About" },
      { path: "/sanjuan", linkText: "San Juan" },
    ],
    flag: "🇺🇸",
    currentLanguage: "English",
    index: {
      heroSection: {
        firstH2Orange: "EXCURSIONS",
        firstH2: "MEDITERRANEAN",
        firstH3: "EXPLORE THE BEST",
        secondH3: "EXPERIENCES IN VALENCIA",
      },
      indexSection1: {
        firstH2: "EXPLORE VALENCIA",
        firstH3: "Discover Valencia's hidden gems.",
        secondH3: "Adventure is waiting for you.",
        button: "BOOK NOW",
      },
      indexSection2: {
        firstH2: "Mediterranean Excursions",
        secondH2: "One of the highest-rated experiences.",
      },
      carouselIndexSection2: [
        {
          avatar: "G", // Initials or URL
          name: "Gerhard",
          country: "Austria",
          date: "October 25, 2024",
          reviewTitle: "Well Organized",
          reviewText: "The trip was superbly organized by the very competent tour guide! Couldn't have been better. At the end we got a great tip about where to eat very well in Valencia, it was perfect! Thank you very much in retrospect!",
          reviewLinkSite: "GetYourGuide",
          reviewLink: "https://www.getyourguide.com/valencia-l49/valencia-visita-en-barca-las-cuevas-de-sant-josep-t835444/?utm_source=getyourguide&utm_medium=sharing&utm_campaign=activity_details",
        },
        {
          avatar: "K",
          name: "Katie",
          country: "Spain",
          date: "September 3, 2024",
          reviewTitle: "FANTASTIC!",
          reviewText: "I am a solo traveler, and this option was a perfect day. The guide was amazing and very informative. The coves were beautiful and everyone was very friendly. From start to finish it was a dream. I highly recommend it!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "G",
          name: "Gotthard",
          country: "Spain",
          date: "July 21, 2024",
          reviewTitle: "The best way to visit a magical place.",
          reviewText: "Wonderful treatment. Olga made the visit very enjoyable. I had visited previously on my own, but for a commitment with friends, I decided to book this visit and it was a great decision. Not only did they love it, but it made me look great with my guests. Highly recommended.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "JB",
          name: "Jaime B",
          country: "Spain",
          date: "July 8, 2024",
          reviewTitle: "A 10 out of 10 getaway",
          reviewText:
            "I wanted to surprise my girlfriend but didn’t know what plan to make. This guided tour was definitely a success. The attention and service from our guide Olga was a 10 out of 10; we laughed a lot and she kept us entertained at all times. The caves are incredible, something that without a guide would be difficult to fully understand. We will definitely return next year.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "CT",
          name: "Cuenta T",
          country: "Spain",
          date: "July 8, 2024",
          reviewTitle: "Unforgettable Family Excursion",
          reviewText: "Everything was perfect! From the spectacular scenery to the attentive care of the guide... Everything is highly recommended, no doubt. I wouldn’t need to highlight anything because everything stood out on its own: despite the weather not being too charming, the visit to the San José Caves was wonderful.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "IG",
          name: "Isaac G",
          country: "Spain",
          date: "July 7, 2024",
          reviewTitle: "You can't miss it.",
          reviewText: "It was an unforgettable experience. Olga was attentive at all times and made us feel like we were on a real adventure. A thousand thanks.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "D",
          name: "Diana",
          country: "Spain",
          date: "July 3, 2024",
          reviewTitle: "Cave visit with friends",
          reviewText: "I loved visiting the caves with my friends, we had a great time! Olga is a fun guide with great energy ✨ We learned a lot and found it to be a super interesting experience. I highly recommend the visit 100%!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "FR",
          name: "Fansu R",
          country: "Spain",
          date: "July 3, 2024",
          reviewTitle: "FANTASTIC!",
          reviewText: "It was a super cool experience. Our host Olga guided us and explained everything always with a smile and a lot of patience with the teenagers. Bravo Olga!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "M",
          name: "Marjorie",
          country: "Spain",
          date: "June 29, 2024",
          reviewTitle: "Fantastic experience",
          reviewText: "This experience exceeded my expectations, we had a very fun morning both on the boat inside the caves and during the car ride. Olga is definitely a girl who makes you feel comfortable, it's like traveling with a friend, she's fun and attentive. Thanks for this beautiful adventure, I highly recommend it 100% if you're looking for a different getaway.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "AL",
          name: "Ana Lucia A",
          country: "Spain",
          date: "June 29, 2024",
          reviewTitle: "Excellent tour and guide",
          reviewText: "The visit to the caves was great, not only because the place is spectacular and leaves you in awe, but also because the guide is fantastic, taking care of every detail. The experience was wonderful. Olga is very kind, and it was truly very interesting. Don't miss this tour!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "A",
          name: "Albert",
          country: "Spain",
          date: "June 29, 2024",
          reviewTitle: "An unknown paradise!",
          reviewText: "The Sant Josep Caves are a paradise on Earth. We loved it because we love hidden gems, and this is one. Plus, Olga is an amazing host. 100% recommended, I would definitely repeat.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "AZ",
          name: "Alvaro Z",
          country: "Spain",
          date: "June 28, 2024",
          reviewTitle: "Spectacular",
          reviewText: "A spectacular excursion. It was a great success. Perfect for spending a different day with family and friends. We loved it!!!!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "IY",
          name: "Isabel Y",
          country: "Spain",
          date: "June 28, 2024",
          reviewTitle: "Super beautiful excursion and wonderful guide",
          reviewText: "This excursion is wonderful and Olga couldn't be a better guide. She radiates charm throughout the trip and her explanations are very interesting. The cave is super beautiful. Navigating an underground river is quite an experience. And even more so with such a great guide!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
      ],
      indexSection3: {
        firstH3: "Mediterranean Excursions is fantastic!",
        firstp: "Mediterranean Excursions is the leading company in discovering the most fascinating corners of Valencia.",
        secondp: "Passion and dedication define each of our experiences. We design unique excursions that connect travelers with the best of the city: its history, culture, gastronomy, and landscapes. Each tour is tailored to meet the desires of our clients, offering a personalized approach.",
        thirdp: "At Mediterranean Excursions, we don’t just do tours; we create unforgettable moments to explore Valencia like never before.",
        fourthp: "Let us guide you through the best-kept secrets of this incredible city!",
      },
      indexSection4: {
        firstH3: "OUR EXCURSIONS",
        propscard: {
          title: "San Juan Caves",
          mainText: "Visit to the San Juan Caves, boat ride in a unique natural setting. Departure and return by private transport from Valencia.",
          duration: "Duration: 3h 30m",
          price: "Price: 120€ / person",
        },
      },
    },
    sanjuan: {
      sanJuanSection2: {
        firstH3: "Enjoy a relaxing boat ride through one of the most spectacular underground rivers!",
        secondH3: "You'll travel 800 meters by boat.",
        thirdH3: "Did you know it's the longest navigable underground river in Europe?",
      },
      sanJuanSection4: {
        firstH3: "PRIVATE GUIDED TOUR",
        secondH3: "(Maxiumum 4 people)",
        thirdH3: "The experience is located in the province of Castellón, an area where I've lived since childhood and enjoy whenever I can.",
      },
      sanJuanSection5: {
        firstH3: "DEPARTURE FROM VALENCIA",
        secondH3: "Departure from Plaza de La Reina, Valencia.",
        thirdH3: "Private transport to La Vall d'Uixó (Castellón).",
        fourthH3: "Guided tour: 3h 30m (approx).",
        fifthH3: "Return to Valencia by private transport.",
      },
      sanJuanSection6: {
        cardTitle: "GUIDED TOUR",
        cardDescription: "Trip package to the San Juan Caves",
        firstH4: "Included Services",
        list: [
          { li: "Private transport.", index: 1 },
          { li: "Pickup in Valencia and return home.", index: 2 },
          { li: "Guided tour of the San Juan Caves.", index: 3 },
          { li: "Boat ride in the San Juan Caves.", index: 4 },
          { li: "All taxes and fees included.", index: 5 },
        ],
        secondH4: "€120",
        secondH4span: "/person",
        button: "BOOK NOW",
      },
    },
    footer: {
      firstH4: "Olga Travel",
      firstp: "Explore the longest navigable underground river in Europe. Join us for an unforgettable experience!",
      secondH4: "Quick Links",
      thirdH4: "Contact Us",
      firstspan: "Address:",
      firstli: "Plaza de La Reina, Valencia, Spain",
      secondspan: "Phone:",
      thirdspan: "Email:",
      privacypolicy: "Privacy Policy",
      termsofservice: "Terms of Service",
    },
  },
  es: {
    links: [
      { path: "/", linkText: "Inicio" },
      { path: "/about", linkText: "Acerca de" },
      { path: "/sanjuan", linkText: "San Juan" },
    ],
    flag: "🇪🇸",
    currentLanguage: "Español",
    index: {
      heroSection: {
        firstH2Orange: "EXCURSIONES",
        firstH2: "MEDITERRÁNEO",
        firstH3: "EXPLORA LAS MEJORES",
        secondH3: "EXPERIENCIAS DE VALENCIA",
      },
      indexSection1: {
        firstH2: "EXPLORA VALENCIA",
        firstH3: "Descubre los rincones secretos de Valencia.",
        secondH3: "La aventura te está esperando.",
        button: "RESERVAR",
      },
      indexSection2: {
        firstH2: "Excursiones Mediterráneo",
        secondH2: "Una de las experiencias mejor valoradas.",
      },
      carouselIndexSection2: [
        {
          avatar: "G", // Iniciales o URL
          name: "Gerhard",
          country: "Austria",
          date: "25 de octubre de 2024",
          reviewTitle: "Muy bien organizado",
          reviewText: "¡El viaje fue superbien organizado por la guía turística muy competente! No podría haber sido mejor. Al final, recibimos un gran consejo sobre dónde comer muy bien en Valencia, ¡fue perfecto! ¡Muchas gracias retrospectivamente!",
          reviewLinkSite: "GetYourGuide",
          reviewLink: "https://www.getyourguide.com/valencia-l49/valencia-visita-en-barca-las-cuevas-de-sant-josep-t835444/?utm_source=getyourguide&utm_medium=sharing&utm_campaign=activity_details",
        },
        {
          avatar: "K",
          name: "Katie",
          country: "España",
          date: "3 de septiembre de 2024",
          reviewTitle: "¡FANTÁSTICO!",
          reviewText: "Soy una viajera sola, y esta opción fue un día perfecto. La guía fue increíble y muy informativa. Las calas eran preciosas y todos fueron muy amables. De principio a fin fue un sueño. ¡Recomiendo mucho!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "G",
          name: "Gotthard",
          country: "España",
          date: "21 de julio de 2024",
          reviewTitle: "La mejor manera de visitar un lugar mágico.",
          reviewText: "Trato maravilloso. Olga hizo que la visita fuera muy agradable. Las había visitado anteriormente por libre, pero para un compromiso con amigos decidí contratar esta visita y acerté de pleno. No solo les encantó, sino que me hizo quedar de maravilla con mis invitados. Muy recomendable.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "JB",
          name: "Jaime B",
          country: "España",
          date: "8 de julio de 2024",
          reviewTitle: "Escapada de 10",
          reviewText: "Quería darle una sorpresa a mi novia pero no sabía qué plan hacer. La verdad es que esta ruta guiada fue un acierto. La atención y el servicio de la guía Olga fue de diez, nos reímos mucho y en todo momento nos mantuvo atendidos. Las cuevas son una pasada, algo que sin guía costaría entender en profundidad. El año que viene volveremos seguro.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "CT",
          name: "Cuenta T",
          country: "España",
          date: "8 de julio de 2024",
          reviewTitle: "Excursión familiar inolvidable",
          reviewText: "¡Todo fue perfecto! Desde las espectaculares escenas hasta el atento trato de la guía... Todo muy recomendable, sin duda. No me haría falta destacar nada porque todo ya era destacable por sí solo: a pesar de que el clima no estaba demasiado encantador, la visita a las Cuevas de San José fue una maravilla.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "IG",
          name: "Isaac G",
          country: "España",
          date: "7 de julio de 2024",
          reviewTitle: "No te lo puedes perder.",
          reviewText: "Ha sido una experiencia inolvidable. Olga estuvo atenta en todo momento y nos hizo sentir toda una aventura. Mil gracias.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "D",
          name: "Diana",
          country: "España",
          date: "3 de julio de 2024",
          reviewTitle: "Visita a las cuevas con amigas",
          reviewText: "Me encantó visitar las cuevas junto con amigas, ¡pasamos un rato genial! Olga es una guía divertida y con muy buena energía ✨ Aprendimos un montón y nos pareció una experiencia súper interesante. ¡Recomiendo la visita al 100%!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "FR",
          name: "Fansu R",
          country: "España",
          date: "3 de julio de 2024",
          reviewTitle: "¡FANTÁSTICO!",
          reviewText: "Ha sido una experiencia súper chula. La anfitriona Olga nos guió y explicó todo siempre con una sonrisa y mucha paciencia con los adolescentes. ¡Bravo Olga!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "M",
          name: "Marjorie",
          country: "España",
          date: "29 de junio de 2024",
          reviewTitle: "Experiencia fantástica",
          reviewText:
            "Esta experiencia ha superado mis expectativas, hemos pasado una mañana muy divertida tanto en la barca dentro de las cuevas como durante el camino en el coche. Olga sin duda es una chica que te hace sentir cómoda, es como si viajaras con una amiga, es divertida y atenta. Gracias por esta bonita aventura, la recomiendo 100% si buscáis una escapada diferente.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "AL",
          name: "Ana Lucia A",
          country: "España",
          date: "29 de junio de 2024",
          reviewTitle: "Excelente tour y guía",
          reviewText: "La visita a las cuevas estuvo genial, no solo porque el sitio es espectacular y quedas maravillado, sino porque la guía es fantástica, cuidando cada detalle. La experiencia ha sido maravillosa. Olga es muy amable, y ha sido de verdad muy interesante. ¡No dejes de tomar este tour!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "A",
          name: "Albert",
          country: "España",
          date: "29 de junio de 2024",
          reviewTitle: "¡Un paraíso desconocido!",
          reviewText: "Las Cuevas de Sant Josep son un paraíso en la Tierra. A nosotros nos gustó porque nos encantan las joyas escondidas, y esto lo es. Además, Olga es una anfitriona increíble. 100% recomendable, volvería a repetir seguro.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "AZ",
          name: "Alvaro Z",
          country: "España",
          date: "28 de junio de 2024",
          reviewTitle: "Espectacular",
          reviewText: "Excursión espectacular. Ha sido todo un acierto. Perfecta para pasar un día diferente en familia y amigos. ¡Nos ha encantado!!!!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "IY",
          name: "Isabel Y",
          country: "España",
          date: "28 de junio de 2024",
          reviewTitle: "Excursión súper bonita y guía maravillosa",
          reviewText: "Esta excursión es maravillosa y Olga no puede ser mejor guía. Rebosa simpatía durante todo el viaje y sus explicaciones son muy interesantes. La cueva es súper bonita. Navegar un río subterráneo es toda una experiencia. ¡Y más con una guía tan genial!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
      ],
      indexSection3: {
        firstH3: "¡Excursiones Mediterráneo es fantástico!",
        firstp: "Excursiones Mediterráneo es la empresa líder en descubrir los rincones más fascinantes de Valencia.",
        secondp: "Pasión y dedicación definen cada una de nuestras experiencias. Diseñamos excursiones únicas que conectan a los viajeros con lo mejor de la ciudad: su historia, cultura, gastronomía y paisajes. Cada recorrido está pensado para adaptarse a los deseos de nuestros clientes, ofreciendo un enfoque personalizado.",
        thirdp: "En Excursiones Mediterráneo, no solo hacemos tours, creamos momentos inolvidables para explorar Valencia como nunca antes.",
        fourthp: "¡Déjanos guiarte por los secretos mejor guardados de esta increíble ciudad!",
      },
      indexSection4: {
        firstH3: "NUESTRAS EXCURSIONES",
        propscard: {
          title: "Cuevas de San Juan",
          mainText: "Visita a las Cuevas de San Juan, paseo en barca en un entorno natural único. Salida y vuelta en transporte privado desde Valencia.",
          duration: "Duración: 3h 30m",
          price: "Precio: 120€ / persona",
        },
      },
    },
    sanjuan: {
      sanJuanSection2: {
        firstH3: "Enjoy a relaxing boat ride through one of the most spectacular underground rivers!",
        secondH3: "You'll travel 800 meters by boat.",
        thirdH3: "Did you know it's the longest navigable underground river in Europe?",
      },
      sanJuanSection4: {
        firstH3: "PRIVATE GUIDED TOUR",
        secondH3: "(Maxiumum 4 people)",
        thirdH3: "The experience is located in the province of Castellón, an area where I've lived since childhood and enjoy whenever I can.",
      },
      sanJuanSection5: {
        firstH3: "DEPARTURE FROM VALENCIA",
        secondH3: "Departure from Plaza de La Reina, Valencia.",
        thirdH3: "Private transport to La Vall d'Uixó (Castellón).",
        fourthH3: "Guided tour: 3h 30m (approx).",
        fifthH3: "Return to Valencia by private transport.",
      },
      sanJuanSection6: {
        cardTitle: "GUIDED TOUR",
        cardDescription: "Trip package to the San Juan Caves",
        firstH4: "Included Services",
        list: [
          { li: "Private transport.", index: 1 },
          { li: "Pickup in Valencia and return home.", index: 2 },
          { li: "Guided tour of the San Juan Caves.", index: 3 },
          { li: "Boat ride in the San Juan Caves.", index: 4 },
          { li: "All taxes and fees included.", index: 5 },
        ],
        secondH4: "€120",
        secondH4span: "/person",
        button: "BOOK NOW",
      },
    },
    footer: {
      firstH4: "Olga Travel",
      firstp: "Explora el río subterráneo navegable más largo de Europa. ¡Únete a nosotros para una experiencia inolvidable!",
      secondH4: "Enlaces Rápidos",
      thirdH4: "Contáctanos",
      firstspan: "Dirección:",
      firstli: "Plaza de La Reina, Valencia, España",
      secondspan: "Teléfono:",
      thirdspan: "Correo Electrónico:",
      privacypolicy: "Política de Privacidad",
      termsofservice: "Términos del Servicio",
    },
  },
  fr: {
    links: [
      { path: "/", linkText: "Accueil" },
      { path: "/about", linkText: "À propos" },
      { path: "/sanjuan", linkText: "San Juan" },
    ],
    flag: "🇫🇷",
    currentLanguage: "Français",
    index: {
      heroSection: {
        firstH2Orange: "EXCURSIONS",
        firstH2: "MÉDITERRANÉEN",
        firstH3: "DÉCOUVREZ LES MEILLEURES",
        secondH3: "EXPÉRIENCES À VALENCE",
      },
      indexSection1: {
        firstH2: "EXPLOREZ VALENCE",
        firstH3: "Découvrez les recoins secrets de Valence.",
        secondH3: "L'aventure vous attend.",
        button: "RÉSERVER",
      },
      indexSection2: {
        firstH2: "Excursions en Méditerranée",
        secondH2: "L'une des expériences les mieux notées.",
      },
      carouselIndexSection2: [
        {
          avatar: "G", // Initiales ou URL
          name: "Gerhard",
          country: "Autriche",
          date: "25 octobre 2024",
          reviewTitle: "Très bien organisé",
          reviewText: "Le voyage a été superbement organisé par un guide touristique très compétent ! Cela n'aurait pas pu être mieux. À la fin, nous avons reçu un excellent conseil sur où bien manger à Valence, c'était parfait ! Merci beaucoup rétrospectivement !",
          reviewLinkSite: "GetYourGuide",
          reviewLink: "https://www.getyourguide.com/valencia-l49/valencia-visita-en-barca-las-cuevas-de-sant-josep-t835444/?utm_source=getyourguide&utm_medium=sharing&utm_campaign=activity_details",
        },
        {
          avatar: "K",
          name: "Katie",
          country: "Espagne",
          date: "3 septembre 2024",
          reviewTitle: "FANTASTIQUE !",
          reviewText: "Je suis une voyageuse solo, et cette option était une journée parfaite. Le guide était incroyable et très informatif. Les criques étaient magnifiques et tout le monde était très sympathique. Du début à la fin, ce fut un rêve. Je recommande vivement !",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "G",
          name: "Gotthard",
          country: "Espagne",
          date: "21 juillet 2024",
          reviewTitle: "La meilleure façon de visiter un lieu magique.",
          reviewText: "Un traitement merveilleux. Olga a rendu la visite très agréable. Je les avais visitées auparavant seul, mais pour un engagement avec des amis, j'ai décidé de réserver cette visite et je ne regrette pas du tout. Non seulement ils ont adoré, mais cela m'a aussi fait très bonne impression auprès de mes invités. Très recommandé.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "JB",
          name: "Jaime B",
          country: "Espagne",
          date: "8 juillet 2024",
          reviewTitle: "Une escapade de 10/10",
          reviewText:
            "Je voulais faire une surprise à ma petite amie mais je ne savais pas quel plan faire. Cette visite guidée s'est avérée être un succès. L'attention et le service de notre guide Olga étaient excellents, nous avons beaucoup ri et elle nous a toujours bien pris en charge. Les grottes sont impressionnantes, quelque chose que sans guide il serait difficile de comprendre en profondeur. Nous reviendrons certainement l'année prochaine.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "CT",
          name: "Cuenta T",
          country: "Espagne",
          date: "8 juillet 2024",
          reviewTitle: "Excursion familiale inoubliable",
          reviewText: "Tout était parfait ! Des paysages spectaculaires à l'attention portée par le guide... Tout est très recommandable, sans aucun doute. Je n'aurais pas besoin de souligner quoi que ce soit car tout était déjà remarquable : malgré un temps peu engageant, la visite des Grottes de San José a été une merveille.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "IG",
          name: "Isaac G",
          country: "Espagne",
          date: "7 juillet 2024",
          reviewTitle: "Vous ne pouvez pas le manquer.",
          reviewText: "Ce fut une expérience inoubliable. Olga a été attentive à chaque instant et nous a fait sentir toute l'aventure. Mille mercis.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "D",
          name: "Diana",
          country: "Espagne",
          date: "3 juillet 2024",
          reviewTitle: "Visite des grottes avec des amies",
          reviewText: "J'ai adoré visiter les grottes avec des amies, nous avons passé un super moment ! Olga est une guide amusante et pleine d'énergie ✨ Nous avons beaucoup appris et nous avons trouvé l'expérience très intéressante. Je recommande la visite à 100 % !",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "FR",
          name: "Fansu R",
          country: "Espagne",
          date: "3 juillet 2024",
          reviewTitle: "FANTASTIQUE !",
          reviewText: "Ce fut une expérience super cool. Notre hôtesse Olga nous a guidés et expliqué tout avec toujours un sourire et beaucoup de patience avec les adolescents. Bravo Olga !",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "M",
          name: "Marjorie",
          country: "Espagne",
          date: "29 juin 2024",
          reviewTitle: "Expérience fantastique",
          reviewText:
            "Cette expérience a dépassé mes attentes, nous avons passé une matinée très amusante aussi bien dans le bateau à l'intérieur des grottes qu'en chemin en voiture. Olga est sans aucun doute une fille qui vous met à l'aise, c'est comme si vous voyagiez avec une amie, elle est drôle et attentionnée. Merci pour cette belle aventure, je la recommande à 100 % si vous cherchez une escapade différente.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "AL",
          name: "Ana Lucia A",
          country: "Espagne",
          date: "29 juin 2024",
          reviewTitle: "Excellent tour et guide",
          reviewText: "La visite des grottes était géniale, non seulement parce que le site est spectaculaire et laisse émerveillé, mais aussi parce que le guide est fantastique, prenant soin de chaque détail. L'expérience a été merveilleuse. Olga est très gentille, et cela a été vraiment très intéressant. Ne manquez pas ce tour !",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "A",
          name: "Albert",
          country: "Espagne",
          date: "29 juin 2024",
          reviewTitle: "Un paradis méconnu !",
          reviewText: "Les Grottes de Sant Josep sont un paradis sur Terre. Nous avons aimé parce que nous adorons les joyaux cachés, et c'en est un. De plus, Olga est une hôtesse incroyable. 100 % recommandé, je reviendrai certainement.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "AZ",
          name: "Alvaro Z",
          country: "Espagne",
          date: "28 juin 2024",
          reviewTitle: "Spectaculaire",
          reviewText: "Excursion spectaculaire. Ce fut un succès total. Parfaite pour passer une journée différente en famille et entre amis. Nous avons adoré !!!!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "IY",
          name: "Isabel Y",
          country: "Espagne",
          date: "28 juin 2024",
          reviewTitle: "Excursion superbe et guide merveilleuse",
          reviewText: "Cette excursion est merveilleuse et Olga est la meilleure guide possible. Elle déborde de sympathie tout au long du voyage et ses explications sont très intéressantes. La grotte est superbe. Naviguer sur une rivière souterraine est toute une expérience. Et encore plus avec une guide aussi géniale !",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
      ],
      indexSection3: {
        firstH3: "Excursions Méditerranée est fantastique !",
        firstp: "Excursions Méditerranée est l'entreprise leader dans la découverte des coins les plus fascinants de Valence.",
        secondp: "La passion et le dévouement définissent chacune de nos expériences. Nous concevons des excursions uniques qui connectent les voyageurs avec ce que la ville a de mieux à offrir : son histoire, sa culture, sa gastronomie et ses paysages. Chaque parcours est conçu pour s'adapter aux désirs de nos clients, avec une approche personnalisée.",
        thirdp: "Chez Excursions Méditerranée, nous ne faisons pas que des visites ; nous créons des moments inoubliables pour explorer Valence comme jamais auparavant.",
        fourthp: "Laissez-nous vous guider à travers les secrets les mieux gardés de cette ville incroyable !",
      },
      indexSection4: {
        firstH3: "NOS EXCURSIONS",
        propscard: {
          title: "Grottes de San Juan",
          mainText: "Visite des grottes de San Juan, promenade en bateau dans un cadre naturel unique. Départ et retour en transport privé depuis Valence.",
          duration: "Durée : 3h 30m",
          price: "Prix : 120€ / personne",
        },
      },
    },
    sanjuan: {
      sanJuanSection2: {
        firstH3: "Enjoy a relaxing boat ride through one of the most spectacular underground rivers!",
        secondH3: "You'll travel 800 meters by boat.",
        thirdH3: "Did you know it's the longest navigable underground river in Europe?",
      },
      sanJuanSection4: {
        firstH3: "PRIVATE GUIDED TOUR",
        secondH3: "(Maxiumum 4 people)",
        thirdH3: "The experience is located in the province of Castellón, an area where I've lived since childhood and enjoy whenever I can.",
      },
      sanJuanSection5: {
        firstH3: "DEPARTURE FROM VALENCIA",
        secondH3: "Departure from Plaza de La Reina, Valencia.",
        thirdH3: "Private transport to La Vall d'Uixó (Castellón).",
        fourthH3: "Guided tour: 3h 30m (approx).",
        fifthH3: "Return to Valencia by private transport.",
      },
      sanJuanSection6: {
        cardTitle: "GUIDED TOUR",
        cardDescription: "Trip package to the San Juan Caves",
        firstH4: "Included Services",
        list: [
          { li: "Private transport.", index: 1 },
          { li: "Pickup in Valencia and return home.", index: 2 },
          { li: "Guided tour of the San Juan Caves.", index: 3 },
          { li: "Boat ride in the San Juan Caves.", index: 4 },
          { li: "All taxes and fees included.", index: 5 },
        ],
        secondH4: "€120",
        secondH4span: "/person",
        button: "BOOK NOW",
      },
    },
    footer: {
      firstH4: "Olga Travel",
      firstp: "Explorez la plus longue rivière souterraine navigable d'Europe. Rejoignez-nous pour une expérience inoubliable!",
      secondH4: "Liens Rapides",
      thirdH4: "Contactez-nous",
      firstspan: "Adresse :",
      firstli: "Plaza de La Reina, Valence, Espagne",
      secondspan: "Téléphone :",
      thirdspan: "Email :",
      privacypolicy: "Politique de Confidentialité",
      termsofservice: "Conditions d'Utilisation",
    },
  },
  ru: {
    links: [
      { path: "/", linkText: "Домой" },
      { path: "/about", linkText: "О нас" },
      { path: "/sanjuan", linkText: "Сан-Хуан" },
    ],
    flag: "🇷🇺",
    currentLanguage: "Русский",
    index: {
      heroSection: {
        firstH2Orange: "ЭКСКУРСИИ",
        firstH2: "СРЕДИЗЕМНОМОРЬЕ",
        firstH3: "ИССЛЕДУЙТЕ ЛУЧШИЕ",
        secondH3: "ВПЕЧАТЛЕНИЯ ВАЛЕНСИИ",
      },
      indexSection1: {
        firstH2: "ИССЛЕДУЙТЕ ВАЛЕНСИЮ",
        firstH3: "Откройте для себя тайные уголки Валенсии.",
        secondH3: "Приключение ждет вас.",
        button: "ЗАБРОНИРОВАТЬ",
      },
      indexSection2: {
        firstH2: "Экскурсии по Средиземноморью",
        secondH2: "Один из самых высоко оцененных опытов.",
      },
      carouselIndexSection2: [
        {
          avatar: "G", // Инициалы или URL
          name: "Герхард",
          country: "Австрия",
          date: "25 октября 2024",
          reviewTitle: "Отличная организация",
          reviewText: "Поездка была великолепно организована очень компетентным гидом! Не могло быть лучше. В конце нам дали отличный совет, где вкусно поесть в Валенсии, это было идеально! Большое спасибо задним числом!",
          reviewLinkSite: "GetYourGuide",
          reviewLink: "https://www.getyourguide.com/valencia-l49/valencia-visita-en-barca-las-cuevas-de-sant-josep-t835444/?utm_source=getyourguide&utm_medium=sharing&utm_campaign=activity_details",
        },
        {
          avatar: "K",
          name: "Кейти",
          country: "Испания",
          date: "3 сентября 2024",
          reviewTitle: "ФАНТАСТИЧЕСКИ!",
          reviewText: "Я путешествую одна, и этот вариант был идеальным днем. Гид был удивительным и очень информативным. Бухты были прекрасными, и все были очень дружелюбны. От начала до конца это был сон. Очень рекомендую!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "G",
          name: "Готтхард",
          country: "Испания",
          date: "21 июля 2024",
          reviewTitle: "Лучший способ посетить волшебное место.",
          reviewText: "Прекрасное обращение. Ольга сделала посещение очень приятным. Я уже посещал эти места самостоятельно, но для встречи с друзьями решил заказать эту экскурсию и не прогадал. Не только они были в восторге, но и я произвел на них отличное впечатление. Очень рекомендую.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "JB",
          name: "Хайме Б",
          country: "Испания",
          date: "8 июля 2024",
          reviewTitle: "Путешествие на 10/10",
          reviewText: "Я хотел удивить свою девушку, но не знал, какой план составить. Эта экскурсия оказалась удачной. Внимание и обслуживание гида Ольги были на высшем уровне, мы много смеялись, и она всегда была рядом. Пещеры потрясающие, без гида их сложно понять в полной мере. Обязательно вернемся в следующем году.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "CT",
          name: "Cuenta T",
          country: "Испания",
          date: "8 июля 2024",
          reviewTitle: "Незабываемая семейная экскурсия",
          reviewText: "Все было идеально! От потрясающих пейзажей до внимательного отношения гида... Все очень рекомендуется, без сомнения. Мне не нужно выделять что-то конкретное, потому что все уже само по себе было замечательно: несмотря на то, что погода была не слишком радушной, посещение пещер Сан-Хосе было великолепным.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "IG",
          name: "Исаак Г",
          country: "Испания",
          date: "7 июля 2024",
          reviewTitle: "Вы не можете этого пропустить.",
          reviewText: "Это был незабываемый опыт. Ольга была внимательна каждую минуту и заставила нас почувствовать всю приключенческую атмосферу. Спасибо огромное.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "D",
          name: "Диана",
          country: "Испания",
          date: "3 июля 2024",
          reviewTitle: "Посещение пещер с подругами",
          reviewText: "Мне понравилось посещение пещер с подругами, мы отлично провели время! Ольга — забавный гид с отличной энергией ✨ Мы много узнали и нашли этот опыт очень интересным. Рекомендую на 100%!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "FR",
          name: "Фансу Р",
          country: "Испания",
          date: "3 июля 2024",
          reviewTitle: "ФАНТАСТИЧЕСКИ!",
          reviewText: "Это был очень крутой опыт. Наша хозяйка Ольга вела нас и объясняла все с улыбкой и большим терпением к подросткам. Браво, Ольга!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "M",
          name: "Марджори",
          country: "Испания",
          date: "29 июня 2024",
          reviewTitle: "Фантастический опыт",
          reviewText: "Этот опыт превзошел мои ожидания, мы отлично провели утро как на лодке внутри пещер, так и во время поездки на машине. Ольга определенно девушка, которая делает вас комфортно, это как путешествие с подругой, она веселая и внимательная. Спасибо за это прекрасное приключение, я рекомендую его на 100%, если вы ищете что-то особенное.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "AL",
          name: "Ана Лусия А",
          country: "Испания",
          date: "29 июня 2024",
          reviewTitle: "Отличный тур и гид",
          reviewText: "Посещение пещер было великолепным, не только потому что место потрясающее и вызывает восхищение, но и потому что гид фантастическая, заботится о каждой детали. Опыт был великолепным. Ольга очень милая, и это действительно было очень интересно. Не упустите этот тур!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "A",
          name: "Альберт",
          country: "Испания",
          date: "29 июня 2024",
          reviewTitle: "Неизвестный рай!",
          reviewText: "Пещеры Сан-Хосеп — это рай на Земле. Они нам понравились, потому что мы любим скрытые жемчужины, и это одна из них. Кроме того, Ольга — потрясающая хозяйка. 100% рекомендую, обязательно повторю.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "AZ",
          name: "Альваро З",
          country: "Испания",
          date: "28 июня 2024",
          reviewTitle: "Впечатляюще",
          reviewText: "Впечатляющая экскурсия. Это был полный успех. Идеально подходит для того, чтобы провести отличный день с семьей и друзьями. Нам очень понравилось!!!!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "IY",
          name: "Изабель Y",
          country: "Испания",
          date: "28 июня 2024",
          reviewTitle: "Прекрасная экскурсия и замечательный гид",
          reviewText: "Эта экскурсия великолепна, и Ольга — лучший гид. Она излучает обаяние на протяжении всей поездки, и ее объяснения очень интересны. Пещера очень красивая. Плавание по подземной реке — это целое приключение. А с таким классным гидом еще лучше!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
      ],
      indexSection3: {
        firstH3: "Экскурсии «Средиземноморье» фантастические!",
        firstp: "«Средиземноморские экскурсии» — ведущая компания по открытию самых захватывающих уголков Валенсии.",
        secondp: "Страсть и преданность определяют каждый из наших туров. Мы разрабатываем уникальные маршруты, которые знакомят путешественников с лучшим, что может предложить город: его историей, культурой, гастрономией и пейзажами. Каждый маршрут адаптирован под желания наших клиентов, предлагая индивидуальный подход.",
        thirdp: "В рамках «Средиземноморских экскурсий» мы не просто проводим туры, мы создаем незабываемые моменты для исследования Валенсии как никогда раньше.",
        fourthp: "Позвольте нам провести вас через самые сокровенные секреты этого удивительного города!",
      },
      indexSection4: {
        firstH3: "НАШИ ЭКСКУРСИИ",
        propscard: {
          title: "Пещеры Сан-Хуан",
          mainText: "Посещение пещер Сан-Хуан, прогулка на лодке в уникальной природной среде. Отправление и возвращение на частном транспорте из Валенсии.",
          duration: "Продолжительность: 3ч 30м",
          price: "Цена: 120€ / человек",
        },
      },
    },
    sanjuan: {
      sanJuanSection2: {
        firstH3: "Enjoy a relaxing boat ride through one of the most spectacular underground rivers!",
        secondH3: "You'll travel 800 meters by boat.",
        thirdH3: "Did you know it's the longest navigable underground river in Europe?",
      },
      sanJuanSection4: {
        firstH3: "PRIVATE GUIDED TOUR",
        secondH3: "(Maxiumum 4 people)",
        thirdH3: "The experience is located in the province of Castellón, an area where I've lived since childhood and enjoy whenever I can.",
      },
      sanJuanSection5: {
        firstH3: "DEPARTURE FROM VALENCIA",
        secondH3: "Departure from Plaza de La Reina, Valencia.",
        thirdH3: "Private transport to La Vall d'Uixó (Castellón).",
        fourthH3: "Guided tour: 3h 30m (approx).",
        fifthH3: "Return to Valencia by private transport.",
      },
      sanJuanSection6: {
        cardTitle: "GUIDED TOUR",
        cardDescription: "Trip package to the San Juan Caves",
        firstH4: "Included Services",
        list: [
          { li: "Private transport.", index: 1 },
          { li: "Pickup in Valencia and return home.", index: 2 },
          { li: "Guided tour of the San Juan Caves.", index: 3 },
          { li: "Boat ride in the San Juan Caves.", index: 4 },
          { li: "All taxes and fees included.", index: 5 },
        ],
        secondH4: "€120",
        secondH4span: "/person",
        button: "BOOK NOW",
      },
    },
    footer: {
      firstH4: "Olga Travel",
      firstp: "Исследуйте самую длинную судоходную подземную реку в Европе. Присоединяйтесь к нам для незабываемого приключения!",
      secondH4: "Быстрые ссылки",
      thirdH4: "Свяжитесь с нами",
      firstspan: "Адрес:",
      firstli: "Пласа-де-ла-Рейна, Валенсия, Испания",
      secondspan: "Телефон:",
      thirdspan: "Электронная почта:",
      privacypolicy: "Политика конфиденциальности",
      termsofservice: "Условия использования",
    },
  },
  de: {
    links: [
      { path: "/", linkText: "Startseite" },
      { path: "/about", linkText: "Über uns" },
      { path: "/sanjuan", linkText: "Sankt Juan" },
    ],
    flag: "🇩🇪",
    currentLanguage: "Deutsch",
    index: {
      heroSection: {
        firstH2Orange: "AUSFLÜGE",
        firstH2: "MITTELMEER",
        firstH3: "ENTDECKEN SIE DIE BESTEN",
        secondH3: "ERLEBNISSE IN VALENCIA",
      },
      indexSection1: {
        firstH2: "ENTDECKE VALENCIA",
        firstH3: "Entdecke die geheimen Ecken Valencias.",
        secondH3: "Das Abenteuer wartet auf dich.",
        button: "JETZT BUCHEN",
      },
      indexSection2: {
        firstH2: "Mittelmeer-Ausflüge",
        secondH2: "Eines der am höchsten bewerteten Erlebnisse.",
      },
      carouselIndexSection2: [
        {
          avatar: "G", // Initialen oder URL
          name: "Gerhard",
          country: "Österreich",
          date: "25. Oktober 2024",
          reviewTitle: "Sehr gut organisiert",
          reviewText: "Die Reise wurde hervorragend von einem sehr kompetenten Reiseführer organisiert! Es hätte nicht besser sein können. Am Ende bekamen wir einen tollen Tipp, wo man in Valencia gut essen kann, es war perfekt! Vielen Dank im Nachhinein!",
          reviewLinkSite: "GetYourGuide",
          reviewLink: "https://www.getyourguide.com/valencia-l49/valencia-visita-en-barca-las-cuevas-de-sant-josep-t835444/?utm_source=getyourguide&utm_medium=sharing&utm_campaign=activity_details",
        },
        {
          avatar: "K",
          name: "Katie",
          country: "Spanien",
          date: "3. September 2024",
          reviewTitle: "FANTASTISCH!",
          reviewText: "Ich bin eine alleinreisende Person und diese Option war ein perfekter Tag. Der Guide war fantastisch und sehr informativ. Die Buchten waren wunderschön und alle waren sehr freundlich. Von Anfang bis Ende war es ein Traum. Ich empfehle es sehr!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "G",
          name: "Gotthard",
          country: "Spanien",
          date: "21. Juli 2024",
          reviewTitle: "Der beste Weg, um einen magischen Ort zu besuchen.",
          reviewText: "Wunderbare Behandlung. Olga machte den Besuch sehr angenehm. Ich hatte die Höhlen bereits zuvor allein besucht, aber für ein Treffen mit Freunden entschied ich mich, diese Führung zu buchen, und es war eine gute Entscheidung. Nicht nur sie waren begeistert, sondern ich konnte auch bei meinen Gästen punkten. Sehr zu empfehlen.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "JB",
          name: "Jaime B",
          country: "Spanien",
          date: "8. Juli 2024",
          reviewTitle: "Eine 10/10 Auszeit",
          reviewText:
            "Ich wollte meine Freundin überraschen, wusste aber nicht, was ich planen sollte. Diese geführte Tour war auf jeden Fall ein Erfolg. Die Aufmerksamkeit und der Service unseres Guides Olga waren ausgezeichnet, wir haben viel gelacht, und sie hat uns immer gut betreut. Die Höhlen sind beeindruckend, etwas, das man ohne Guide schwer in vollem Umfang verstehen könnte. Wir werden sicherlich nächstes Jahr zurückkehren.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "CT",
          name: "Cuenta T",
          country: "Spanien",
          date: "8. Juli 2024",
          reviewTitle: "Unvergessliche Familienausflug",
          reviewText: "Alles war perfekt! Von den spektakulären Landschaften bis zur aufmerksamen Betreuung durch den Guide... Alles ist sehr empfehlenswert, ohne Zweifel. Ich müsste nichts hervorheben, weil alles schon von selbst herausragte: Trotz des nicht gerade einladenden Wetters war der Besuch der San José-Höhlen wunderbar.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "IG",
          name: "Isaac G",
          country: "Spanien",
          date: "7. Juli 2024",
          reviewTitle: "Das darfst du nicht verpassen.",
          reviewText: "Es war ein unvergessliches Erlebnis. Olga war die ganze Zeit aufmerksam und ließ uns das ganze Abenteuer spüren. Vielen Dank.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "D",
          name: "Diana",
          country: "Spanien",
          date: "3. Juli 2024",
          reviewTitle: "Besuch der Höhlen mit Freundinnen",
          reviewText: "Ich habe es geliebt, die Höhlen mit meinen Freundinnen zu besuchen, wir hatten eine tolle Zeit! Olga ist eine lustige Guide mit großartiger Energie ✨ Wir haben viel gelernt und fanden die Erfahrung super interessant. Ich empfehle den Besuch zu 100%!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "FR",
          name: "Fansu R",
          country: "Spanien",
          date: "3. Juli 2024",
          reviewTitle: "FANTASTISCH!",
          reviewText: "Es war eine super coole Erfahrung. Unsere Gastgeberin Olga führte uns und erklärte alles immer mit einem Lächeln und viel Geduld gegenüber den Teenagern. Bravo Olga!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "M",
          name: "Marjorie",
          country: "Spanien",
          date: "29. Juni 2024",
          reviewTitle: "Fantastische Erfahrung",
          reviewText:
            "Diese Erfahrung hat meine Erwartungen übertroffen, wir hatten einen sehr lustigen Vormittag sowohl im Boot innerhalb der Höhlen als auch während der Autofahrt. Olga ist definitiv jemand, der dich sich wohl fühlen lässt, es ist wie eine Reise mit einer Freundin, sie ist lustig und aufmerksam. Danke für dieses schöne Abenteuer, ich empfehle es zu 100%, wenn ihr eine andere Art von Auszeit sucht.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "AL",
          name: "Ana Lucia A",
          country: "Spanien",
          date: "29. Juni 2024",
          reviewTitle: "Ausgezeichneter Ausflug und Guide",
          reviewText: "Der Besuch der Höhlen war großartig, nicht nur weil der Ort spektakulär und atemberaubend ist, sondern auch weil die Guide fantastisch ist und jedes Detail beachtet. Die Erfahrung war wunderbar. Olga ist sehr freundlich, und es war wirklich sehr interessant. Verpasst diesen Ausflug nicht!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "A",
          name: "Albert",
          country: "Spanien",
          date: "29. Juni 2024",
          reviewTitle: "Ein unbekanntes Paradies!",
          reviewText: "Die Sant Josep-Höhlen sind ein Paradies auf Erden. Sie gefielen uns, weil wir versteckte Juwelen lieben, und das hier ist eines davon. Außerdem ist Olga eine fantastische Gastgeberin. 100% empfehlenswert, ich würde auf jeden Fall wiederholen.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "AZ",
          name: "Alvaro Z",
          country: "Spanien",
          date: "28. Juni 2024",
          reviewTitle: "Spektakulär",
          reviewText: "Eine spektakuläre Exkursion. Es war ein voller Erfolg. Perfekt, um einen anderen Tag mit Familie und Freunden zu verbringen. Es hat uns sehr gefallen!!!!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "IY",
          name: "Isabel Y",
          country: "Spanien",
          date: "28. Juni 2024",
          reviewTitle: "Wunderschöne Exkursion und großartige Guide",
          reviewText: "Diese Exkursion ist wundervoll, und Olga könnte keine bessere Guide sein. Sie strahlt während der gesamten Reise Charme aus, und ihre Erklärungen sind sehr interessant. Die Höhle ist wunderschön. Ein unterirdischer Fluss zu paddeln ist eine echte Erfahrung. Und noch mehr mit so einer großartigen Guide!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
      ],
      indexSection3: {
        firstH3: "Mittelmeer-Ausflüge sind fantastisch!",
        firstp: "Mittelmeer-Ausflüge ist das führende Unternehmen zur Entdeckung der faszinierendsten Ecken von Valencia.",
        secondp: "Leidenschaft und Hingabe prägen jede unserer Erfahrungen. Wir gestalten einzigartige Ausflüge, die Reisende mit dem Besten der Stadt verbinden: ihrer Geschichte, Kultur, Gastronomie und ihren Landschaften. Jede Tour ist maßgeschneidert, um den Wünschen unserer Kunden gerecht zu werden, mit einem persönlichen Ansatz.",
        thirdp: "Bei Mittelmeer-Ausflügen machen wir nicht nur Touren, wir schaffen unvergessliche Momente, um Valencia wie nie zuvor zu erkunden.",
        fourthp: "Lassen Sie uns Sie durch die bestgehüteten Geheimnisse dieser unglaublichen Stadt führen!",
      },
      // German
      indexSection4: {
        firstH3: "UNSERE AUSFLÜGE",
        propscard: {
          title: "San Juan Höhlen",
          mainText: "Besuch der San Juan Höhlen, Bootsfahrt in einzigartiger Naturkulisse. Abfahrt und Rückkehr mit privatem Transport von Valencia aus.",
          duration: "Dauer: 3:30 Std",
          price: "Preis: 120€ / Person",
        },
      },
    },
    sanjuan: {
      sanJuanSection2: {
        firstH3: "Enjoy a relaxing boat ride through one of the most spectacular underground rivers!",
        secondH3: "You'll travel 800 meters by boat.",
        thirdH3: "Did you know it's the longest navigable underground river in Europe?",
      },
      sanJuanSection4: {
        firstH3: "PRIVATE GUIDED TOUR",
        secondH3: "(Maxiumum 4 people)",
        thirdH3: "The experience is located in the province of Castellón, an area where I've lived since childhood and enjoy whenever I can.",
      },
      sanJuanSection5: {
        firstH3: "DEPARTURE FROM VALENCIA",
        secondH3: "Departure from Plaza de La Reina, Valencia.",
        thirdH3: "Private transport to La Vall d'Uixó (Castellón).",
        fourthH3: "Guided tour: 3h 30m (approx).",
        fifthH3: "Return to Valencia by private transport.",
      },
      sanJuanSection6: {
        cardTitle: "GUIDED TOUR",
        cardDescription: "Trip package to the San Juan Caves",
        firstH4: "Included Services",
        list: [
          { li: "Private transport.", index: 1 },
          { li: "Pickup in Valencia and return home.", index: 2 },
          { li: "Guided tour of the San Juan Caves.", index: 3 },
          { li: "Boat ride in the San Juan Caves.", index: 4 },
          { li: "All taxes and fees included.", index: 5 },
        ],
        secondH4: "€120",
        secondH4span: "/person",
        button: "BOOK NOW",
      },
    },
    footer: {
      firstH4: "Olga Travel",
      firstp: "Entdecken Sie den längsten schiffbaren unterirdischen Fluss Europas. Begleiten Sie uns für ein unvergessliches Erlebnis!",
      secondH4: "Schnellzugriff",
      thirdH4: "Kontakt",
      firstspan: "Adresse:",
      firstli: "Plaza de La Reina, Valencia, Spanien",
      secondspan: "Telefon:",
      thirdspan: "E-Mail:",
      privacypolicy: "Datenschutzrichtlinie",
      termsofservice: "Nutzungsbedingungen",
    },
  },
  it: {
    links: [
      { path: "/", linkText: "Home" },
      { path: "/about", linkText: "Chi siamo" },
      { path: "/sanjuan", linkText: "San Juan" },
    ],
    flag: "🇮🇹",
    currentLanguage: "Italiano",
    index: {
      heroSection: {
        firstH2Orange: "GITE",
        firstH2: "MEDITERRANEO",
        firstH3: "ESPLORA LE MIGLIORI",
        secondH3: "ESPERIENZE DI VALENCIA",
      },
      indexSection1: {
        firstH2: "ESPLORA VALENCIA",
        firstH3: "Scopri gli angoli nascosti di Valencia.",
        secondH3: "L'avventura ti sta aspettando.",
        button: "PRENOTA ORA",
      },
      indexSection2: {
        firstH2: "Escursioni nel Mediterraneo",
        secondH2: "Una delle esperienze più apprezzate.",
      },
      carouselIndexSection2: [
        {
          avatar: "G", // Iniziali o URL
          name: "Gerhard",
          country: "Austria",
          date: "25 ottobre 2024",
          reviewTitle: "Molto ben organizzato",
          reviewText: "Il viaggio è stato superlativamente organizzato da una guida turistica molto competente! Non avrebbe potuto essere migliore. Alla fine abbiamo ricevuto un ottimo consiglio su dove mangiare bene a Valencia, è stato perfetto! Grazie mille in retrospettiva!",
          reviewLinkSite: "GetYourGuide",
          reviewLink: "https://www.getyourguide.com/valencia-l49/valencia-visita-en-barca-las-cuevas-de-sant-josep-t835444/?utm_source=getyourguide&utm_medium=sharing&utm_campaign=activity_details",
        },
        {
          avatar: "K",
          name: "Katie",
          country: "Spagna",
          date: "3 settembre 2024",
          reviewTitle: "FANTASTICO!",
          reviewText: "Sono una viaggiatrice solitaria, e questa opzione è stata una giornata perfetta. La guida era fantastica e molto informativa. Le calette erano bellissime e tutti sono stati molto gentili. Dall'inizio alla fine è stato un sogno. Lo consiglio vivamente!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "G",
          name: "Gotthard",
          country: "Spagna",
          date: "21 luglio 2024",
          reviewTitle: "Il miglior modo per visitare un luogo magico.",
          reviewText: "Trattamento meraviglioso. Olga ha reso la visita molto piacevole. Le avevo già visitate in precedenza da solo, ma per un impegno con gli amici ho deciso di prenotare questa visita e ho fatto centro. Non solo gli è piaciuta molto, ma mi ha anche fatto fare una bella figura con i miei ospiti. Altamente raccomandato.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "JB",
          name: "Jaime B",
          country: "Spagna",
          date: "8 luglio 2024",
          reviewTitle: "Una fuga da 10/10",
          reviewText:
            "Volevo fare una sorpresa alla mia ragazza, ma non sapevo quale piano fare. Questo tour guidato è stato sicuramente un successo. L'attenzione e il servizio della nostra guida Olga sono stati eccellenti, abbiamo riso molto ed è stata sempre presente. Le grotte sono incredibili, qualcosa che senza guida sarebbe difficile comprendere appieno. Torneremo sicuramente l'anno prossimo.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "CT",
          name: "Cuenta T",
          country: "Spagna",
          date: "8 luglio 2024",
          reviewTitle: "Gita familiare indimenticabile",
          reviewText: "È stato tutto perfetto! Dai paesaggi spettacolari all'attenzione premurosa della guida... Tutto è altamente raccomandabile, senza dubbio. Non c'era bisogno di evidenziare nulla perché tutto era già eccezionale di per sé: nonostante il tempo non fosse dei migliori, la visita alle Grotte di San José è stata meravigliosa.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "IG",
          name: "Isaac G",
          country: "Spagna",
          date: "7 luglio 2024",
          reviewTitle: "Non puoi perderlo.",
          reviewText: "È stata un'esperienza indimenticabile. Olga è stata attenta in ogni momento e ci ha fatto sentire tutta l'avventura. Mille grazie.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "D",
          name: "Diana",
          country: "Spagna",
          date: "3 luglio 2024",
          reviewTitle: "Visita alle grotte con le amiche",
          reviewText: "Mi è piaciuto tantissimo visitare le grotte con le mie amiche, ci siamo divertite un sacco! Olga è una guida divertente con molta energia ✨ Abbiamo imparato tanto e abbiamo trovato l'esperienza molto interessante. Consiglio la visita al 100%!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "FR",
          name: "Fansu R",
          country: "Spagna",
          date: "3 luglio 2024",
          reviewTitle: "FANTASTICO!",
          reviewText: "È stata un'esperienza davvero cool. La nostra ospite Olga ci ha guidati e spiegato tutto sempre con un sorriso e molta pazienza con gli adolescenti. Bravo Olga!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "M",
          name: "Marjorie",
          country: "Spagna",
          date: "29 giugno 2024",
          reviewTitle: "Esperienza fantastica",
          reviewText:
            "Questa esperienza ha superato le mie aspettative, abbiamo passato una mattinata molto divertente sia sulla barca dentro le grotte che durante il tragitto in macchina. Olga è decisamente una persona che ti fa sentire a tuo agio, è come viaggiare con un'amica, è divertente e attenta. Grazie per questa bella avventura, la consiglio al 100% se cercate una fuga diversa dal solito.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "AL",
          name: "Ana Lucia A",
          country: "Spagna",
          date: "29 giugno 2024",
          reviewTitle: "Tour eccellente e guida fantastica",
          reviewText: "La visita alle grotte è stata fantastica, non solo perché il posto è spettacolare e lascia a bocca aperta, ma anche perché la guida è fantastica, curando ogni dettaglio. L'esperienza è stata meravigliosa. Olga è molto gentile, ed è stata davvero molto interessante. Non perdete questo tour!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "A",
          name: "Albert",
          country: "Spagna",
          date: "29 giugno 2024",
          reviewTitle: "Un paradiso sconosciuto!",
          reviewText: "Le Grotte di Sant Josep sono un paradiso in terra. Ci sono piaciute perché adoriamo le gemme nascoste, e questa lo è. Inoltre, Olga è un'ospite fantastica. 100% consigliato, sicuramente ripeterò.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "AZ",
          name: "Alvaro Z",
          country: "Spagna",
          date: "28 giugno 2024",
          reviewTitle: "Spettacolare",
          reviewText: "Escursione spettacolare. È stato un vero successo. Perfetta per trascorrere una giornata diversa con la famiglia e gli amici. Ci è piaciuta tantissimo!!!!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "IY",
          name: "Isabel Y",
          country: "Spagna",
          date: "28 giugno 2024",
          reviewTitle: "Escursione bellissima e guida meravigliosa",
          reviewText: "Questa escursione è meravigliosa e Olga non potrebbe essere una guida migliore. È piena di simpatia durante tutto il viaggio e le sue spiegazioni sono molto interessanti. La grotta è bellissima. Navigare su un fiume sotterraneo è un'esperienza incredibile. E ancora di più con una guida così fantastica!",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
      ],
      indexSection3: {
        firstH3: "Escursioni Mediterranee è fantastico!",
        firstp: "Escursioni Mediterranee è l'azienda leader nella scoperta degli angoli più affascinanti di Valencia.",
        secondp: "Passione e dedizione definiscono ogni nostra esperienza. Creiamo escursioni uniche che connettono i viaggiatori con il meglio della città: la sua storia, cultura, gastronomia e paesaggi. Ogni percorso è pensato per adattarsi ai desideri dei nostri clienti, offrendo un approccio personalizzato.",
        thirdp: "Con Escursioni Mediterranee non facciamo solo tour, creiamo momenti indimenticabili per esplorare Valencia come mai prima d'ora.",
        fourthp: "Lasciaci guidarti attraverso i segreti meglio custoditi di questa incredibile città!",
      },
      indexSection4: {
        firstH3: "LE NOSTRE ESCURSIONI",
        propscard: {
          title: "Grotte di San Juan",
          mainText: "Visita alle Grotte di San Juan, giro in barca in un ambiente naturale unico. Partenza e ritorno con trasporto privato da Valencia.",
          duration: "Durata: 3h 30m",
          price: "Prezzo: 120€ / persona",
        },
      },
    },
    sanjuan: {
      sanJuanSection2: {
        firstH3: "Enjoy a relaxing boat ride through one of the most spectacular underground rivers!",
        secondH3: "You'll travel 800 meters by boat.",
        thirdH3: "Did you know it's the longest navigable underground river in Europe?",
      },
      sanJuanSection4: {
        firstH3: "PRIVATE GUIDED TOUR",
        secondH3: "(Maxiumum 4 people)",
        thirdH3: "The experience is located in the province of Castellón, an area where I've lived since childhood and enjoy whenever I can.",
      },
      sanJuanSection5: {
        firstH3: "DEPARTURE FROM VALENCIA",
        secondH3: "Departure from Plaza de La Reina, Valencia.",
        thirdH3: "Private transport to La Vall d'Uixó (Castellón).",
        fourthH3: "Guided tour: 3h 30m (approx).",
        fifthH3: "Return to Valencia by private transport.",
      },
      sanJuanSection6: {
        cardTitle: "GUIDED TOUR",
        cardDescription: "Trip package to the San Juan Caves",
        firstH4: "Included Services",
        list: [
          { li: "Private transport.", index: 1 },
          { li: "Pickup in Valencia and return home.", index: 2 },
          { li: "Guided tour of the San Juan Caves.", index: 3 },
          { li: "Boat ride in the San Juan Caves.", index: 4 },
          { li: "All taxes and fees included.", index: 5 },
        ],
        secondH4: "€120",
        secondH4span: "/person",
        button: "BOOK NOW",
      },
    },
    footer: {
      firstH4: "Olga Travel",
      firstp: "Esplora il fiume sotterraneo navigabile più lungo d'Europa. Unisciti a noi per un'esperienza indimenticabile!",
      secondH4: "Link Rapidi",
      thirdH4: "Contattaci",
      firstspan: "Indirizzo:",
      firstli: "Plaza de La Reina, Valencia, Spagna",
      secondspan: "Telefono:",
      thirdspan: "Email:",
      privacypolicy: "Informativa sulla Privacy",
      termsofservice: "Termini di Servizio",
    },
  },
};
