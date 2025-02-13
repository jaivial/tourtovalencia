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

export type IndexSection5Type = {
  firstH3: string;
  secondH3: string;
};

export type IndexFeaturesType = {
  firstSquareTitle: string;
  firstSquareDescription: string;
  secondSquareTitle: string;
  secondSquareDescription: string;
  thirdSquareTitle: string;
  thirdSquareDescription: string;
  fourthSquareTitle: string;
  fourthSquareDescription: string;
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

export type sanJuanSection1Type = {
  firstH3: string;
  firstSquareH3: string;
  firstSquareP: string;
  secondSquareH3: string;
  secondSquareP: string;
  thirdSquareH3: string;
  thirdSquareP: string;
  button: string;
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

export type sanJuanSection3Type = {
  images: {
    source: string;
    alt: string;
  }[];
};

export type Index = {
  heroSection: HeroSectionType;
  indexSection1: IndexSection1Type;
  indexSection2: IndexSection2Type;
  indexSection3: IndexSection3Type;
  carouselIndexSection2: Review[];
  indexSection4: IndexSection4Type;
  indexSection5: IndexSection5Type;
  indexFeatures: IndexFeaturesType;
};

export type SanJuan = {
  sanJuanSection1: sanJuanSection1Type;
  sanJuanSection2: sanJuansection2Type;
  sanJuanSection3: sanJuanSection3Type;
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
  common: {
    bookNow: string;
    toursMenu: {
      caves: string;
    };
  };
  timeline: {
    title: string;
    subtitle: string;
    steps: {
      title: string;
      description: string;
    }[];
  };
  accessibility: {
    title: string;
    wheelchairAccess: string;
    babySeating: string;
    helpText: string;
    phoneNumber: string;
  };
  additionalInfo: {
    title: string;
    confirmation: string;
    participation: string;
    weatherDependent: string;
    minimumRequired: string;
    privateActivity: string;
  };
  cancellation: {
    title: string;
    freeCancellation: string;
    fullRefund24h: string;
    noRefund24h: string;
    noChanges24h: string;
    timeZoneNote: string;
  };
  indexSection6: {
    title: string;
    accessibility: {
      title: string;
      wheelchair: string;
      babies: string;
    };
    additional: {
      title: string;
      confirmation: string;
      participation: string;
      weather: string;
      minTravelers: string;
      private: string;
    };
    cancellation: {
      title: string;
      free: string;
      noRefund: string;
      noChanges: string;
      deadline: string;
      weather: string;
      minParticipants: string;
      moreDetails: string;
    };
  };
};

export const languages: Record<string, LanguageData> = {
  en: {
    links: [
      { path: "/", linkText: "Home" },
      { path: "/book", linkText: "Book Now" },
    ],
    flag: "🇺🇸",
    currentLanguage: "English",
    index: {
      heroSection: {
        firstH2Orange: "MEDITERRANEAN",
        firstH2: "EXCURSIONS",
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
            "I wanted to surprise my girlfriend but didn't know what plan to make. This guided tour was definitely a success. The attention and service from our guide Olga was a 10 out of 10; we laughed a lot and she kept us entertained at all times. The caves are incredible, something that without a guide would be difficult to fully understand. We will definitely return next year.",
          reviewLinkSite: "TripAdvisor",
          reviewLink: "https://www.tripadvisor.es/AttractionProductReview-g187529-d27928104-Visit_to_the_Sant_Josep_Caves-Valencia_Province_of_Valencia_Valencian_Community.html",
        },
        {
          avatar: "CT",
          name: "Cuenta T",
          country: "Spain",
          date: "July 8, 2024",
          reviewTitle: "Unforgettable Family Excursion",
          reviewText: "Everything was perfect! From the spectacular scenery to the attentive care of the guide... Everything is highly recommended, no doubt. I wouldn't need to highlight anything because everything stood out on its own: despite the weather not being too charming, the visit to the San José Caves was wonderful.",
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
        thirdp: "At Mediterranean Excursions, we don't just do tours; we create unforgettable moments to explore Valencia like never before.",
        fourthp: "Let us guide you through the best-kept secrets of this incredible city!",
      },
      indexSection4: {
        firstH3: "OUR EXCURSIONS",
        propscard: {
          title: "San José Caves",
          mainText: "Visit to the San José Caves, boat ride in a unique natural setting. Departure and return by private transport from Valencia.",
          duration: "Duration: 3h 30m",
          price: "Price: 120€ / person",
        },
      },
      indexSection5: {
        firstH3: "Explore The San José Caves",
        secondH3: "A unique underground adventure with departure from Valencia",
      },
      indexFeatures: {
        firstSquareTitle: "Bookings",
        firstSquareDescription: "We typically accept bookings at least 24 hours before the tour. The minimum legal age for a passenger is over 2 years old.",
        secondSquareTitle: "Prices",
        secondSquareDescription: "120€ per person. The maximum number of participants per tour is 10 people.",
        thirdSquareTitle: "Languages",
        thirdSquareDescription: "All our tours can be narrated in Spanish and English.",
        fourthSquareTitle: "Pets",
        fourthSquareDescription: "Pets are not allowed during the tour.",
      },
    },
    sanjuan: {
      sanJuanSection1: {
        firstH3: "Discover the underground magic of Castellón in a unique journey through the San José Caves",
        firstSquareH3: "3.5 Hours",
        firstSquareP: "Tour Duration",
        secondSquareH3: "Expert Guides",
        secondSquareP: "Small Groups",
        thirdSquareH3: "Boat Trip",
        thirdSquareP: "Unique Experience",
        button: "Book Now",
      },
      sanJuanSection2: {
        firstH3: "Enjoy a relaxing boat ride through one of the most spectacular underground rivers!",
        secondH3: "You'll travel 800 meters by boat.",
        thirdH3: "Did you know it's the longest navigable underground river in Europe?",
      },
      sanJuanSection3: {
        images: [
          { source: '/photo4IS3.webp', alt: 'San José Caves entrance' },
          { source: '/olgaphoto6.jpeg', alt: 'Cave exploration' },
          { source: '/photo2IS3.webp', alt: 'Underground river view' },
          { source: '/airbnb.jpeg', alt: 'Cave exploration' },
          { source: '/olgaphoto8.jpeg', alt: 'Cave exploration' },
          { source: '/photo1IndexSection2.webp', alt: 'Cave exploration' },
          { source: '/photo3IS3.webp', alt: 'Cave formations' },
          { source: '/photo4IS3.webp', alt: 'Boat journey through caves' },
          { source: '/photo1IS3.webp', alt: 'Boat journey through caves' },
          { source: '/olgaphoto9.jpeg', alt: 'Cave exploration' },
          { source: '/olgaphoto1.jpeg', alt: 'Cave interior view' },
          { source: '/olgaphoto5.jpeg', alt: 'Cave exploration' },
          { source: '/olgaphoto2.jpeg', alt: 'Cave exploration' },
          { source: '/olgaphoto3.jpeg', alt: 'Cave exploration' },
          { source: '/olgaphoto4.jpeg', alt: 'Cave exploration' },
          { source: '/olgaphoto7.jpeg', alt: 'Cave exploration' },
          { source: '/airbnb2.jpeg', alt: 'Cave exploration' },
          { source: '/airbnb3.avif', alt: 'Cave exploration' },
        ]
      },
      sanJuanSection4: {
        firstH3: "EXCLUSIVE GUIDED TOUR",
        secondH3: "(Small groups of maximum 10 people)",
        thirdH3: "The experience takes place in the province of Castellón, a region we know perfectly and where we offer the best tourist routes.",
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
        cardDescription: "Trip package to the San José Caves",
        firstH4: "Included Services",
        list: [
          { li: "Private transport.", index: 1 },
          { li: "Pickup in Valencia and return home.", index: 2 },
          { li: "Guided tour of the San José Caves.", index: 3 },
          { li: "Boat ride in the San José Caves.", index: 4 },
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
    common: {
      bookNow: "Book Now",
      toursMenu: {
        caves: "San José Caves"
      },
    },
    timeline: {
      title: "What to Expect",
      subtitle: "Itinerary",
      steps: [
        {
          title: "Meeting Point",
          description: "We'll depart from Valencia (maximum 4 people) and drive for approximately 40 minutes to La Vall D'uixo (Castellón)."
        },
        {
          title: "Arrival at the Caves",
          description: "Once there, we'll begin the cave tour that lasts about 40 minutes at a constant temperature of 20°."
        },
        {
          title: "Exploration",
          description: "The tour consists of 800 meters by boat and 250 meters on foot. There are no risks or dangerous situations during the visit."
        },
        {
          title: "Unique Experience",
          description: "Dare to enjoy something different and special. Feel the sensation of time standing still in a very special atmosphere."
        },
        {
          title: "Return",
          description: "After the visit, we'll return to Valencia to the starting point"
        }
      ]
    },
    accessibility: {
      title: "Accessibility",
      wheelchairAccess: "Not wheelchair accessible",
      babySeating: "Babies must be seated on lap",
      helpText: "If you have any questions about accessibility, we'll be happy to help. Just call the following number and indicate the product code: 482538P1",
      phoneNumber: "+34 91 177 6743"
    },
    additionalInfo: {
      title: "Additional Information",
      confirmation: "Confirmation will be received at time of booking",
      participation: "Most travelers can participate",
      weatherDependent: "Good weather conditions are required for this experience. If canceled due to poor weather, you'll be offered a different date or a full refund.",
      minimumRequired: "This experience requires a minimum number of travelers. If canceled because the minimum isn't met, you'll be offered a different date/experience or a full refund.",
      privateActivity: "This is a private tour/activity. Only your group will participate"
    },
    cancellation: {
      title: "Cancellation Policy",
      freeCancellation: "Free cancellation",
      fullRefund24h: "For a full refund, cancel at least 24 hours before the experience's start date",
      noRefund24h: "If you cancel less than 24 hours before the experience's start date, the amount paid will not be refunded",
      noChanges24h: "Any changes made less than 24 hours before the experience's start date will not be accepted",
      timeZoneNote: "Cut-off times are based on the experience's local time",
    },
    indexSection6: {
      title: "Important Information",
      accessibility: {
        title: "Accessibility Information",
        wheelchair: "Not wheelchair accessible",
        babies: "Babies must sit on laps"
      },
      additional: {
        title: "Additional Information",
        confirmation: "Confirmation will be received at the time of booking",
        participation: "Most travelers can participate in the experience",
        weather: "The experience requires good weather conditions. If canceled due to bad weather, you will be offered an alternative date or a full refund",
        minTravelers: "A minimum number of travelers is required for this experience. If canceled due to not meeting this requirement, you will be offered another date/experience or a full refund",
        private: "This is a private tour/activity; only your group will participate"
      },
      cancellation: {
        title: "Cancellation Policy",
        free: "Free cancellation up to 24 hours before the start of the experience for a full refund",
        noRefund: "No refund if canceled less than 24 hours before the experience starts",
        noChanges: "No changes accepted within 24 hours of the experience start time",
        deadline: "The deadline is based on the local time of the experience location",
        weather: "Weather-dependent experiences will offer an alternative date or full refund if canceled due to bad weather",
        minParticipants: "Experiences requiring a minimum number of participants will offer an alternative date/experience or full refund if canceled due to insufficient participants",
        moreDetails: "For more details, refer to the cancellation policy"
      }
    }
  },
  es: {
    links: [
      { path: "/", linkText: "Inicio" },
      { path: "/book", linkText: "Reservar" },
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
          title: "Cuevas de San José",
          mainText: "Visita a las Cuevas de San José, paseo en barca en un entorno natural único. Salida y vuelta en transporte privado desde Valencia.",
          duration: "Duración: 3h 30m",
          price: "Precio: 120€ / persona",
        },
      },
      indexSection5: {
        firstH3: "Explora Las Cuevas de San José",
        secondH3: "Una aventura subterránea única con salida desde Valencia",
      },
      indexFeatures: {
        firstSquareTitle: "Reservas",
        firstSquareDescription: "Normalmente aceptaremos reservas al menos 24 horas antes del tour. La edad legal mínima para un pasajero es de más de 2 años.",
        secondSquareTitle: "Precios",
        secondSquareDescription: "120€ por persona. El número máximo de participantes por tour es de 10 personas.",
        thirdSquareTitle: "Idiomas",
        thirdSquareDescription: "Todos nuestros tours pueden ser narrados en español e inglés.",
        fourthSquareTitle: "Mascotas",
        fourthSquareDescription: "No se permiten mascotas durante el tour.",
      },
    },
    sanjuan: {
      sanJuanSection1: {
        firstH3: "Descubre la magia subterránea de Castellón en un viaje único por las Cuevas de San José",
        firstSquareH3: "3.5 Horas",
        firstSquareP: "Duración de la Excursión",
        secondSquareH3: "Guías Expertos",
        secondSquareP: "Grupos Reducidos",
        thirdSquareH3: "Viaje en Barca",
        thirdSquareP: "Experiencia Única",
        button: "Reserva Ahora",
      },
      sanJuanSection2: {
        firstH3: "Disfruta de un relajante paseo en barca a través de uno de los ríos subterráneos más espectaculares.",
        secondH3: "Viajarás 800 metros en barca.",
        thirdH3: "¿Sabías que es el río subterráneo navegable más largo de Europa?",
      },
      sanJuanSection3: {
        images: [
          { source: '/photo4IS3.webp', alt: 'San José Caves entrance' },
          { source: '/olgaphoto6.jpeg', alt: 'Cave exploration' },
          { source: '/photo2IS3.webp', alt: 'Underground river view' },
          { source: '/airbnb.jpeg', alt: 'Cave exploration' },
          { source: '/olgaphoto8.jpeg', alt: 'Cave exploration' },
          { source: '/photo1IndexSection2.webp', alt: 'Cave exploration' },
          { source: '/photo3IS3.webp', alt: 'Cave formations' },
          { source: '/photo4IS3.webp', alt: 'Boat journey through caves' },
          { source: '/photo1IS3.webp', alt: 'Boat journey through caves' },
          { source: '/olgaphoto9.jpeg', alt: 'Cave exploration' },
          { source: '/olgaphoto1.jpeg', alt: 'Cave interior view' },
          { source: '/olgaphoto5.jpeg', alt: 'Cave exploration' },
          { source: '/olgaphoto2.jpeg', alt: 'Cave exploration' },
          { source: '/olgaphoto3.jpeg', alt: 'Cave exploration' },
          { source: '/olgaphoto4.jpeg', alt: 'Cave exploration' },
          { source: '/olgaphoto7.jpeg', alt: 'Cave exploration' },
          { source: '/airbnb2.jpeg', alt: 'Cave exploration' },
          { source: '/airbnb3.avif', alt: 'Cave exploration' },
        ]
      },
      sanJuanSection4: {
        firstH3: "TOUR GUIADO EXCLUSIVO",
        secondH3: "(Grupos reducidos de máximo 10 personas)",
        thirdH3: "La experiencia se desarrolla en la provincia de Castellón, una región que conocemos a la perfección y donde ofrecemos las mejores rutas turísticas.",
      },
      sanJuanSection5: {
        firstH3: "SALIDA DESDE VALENCIA",
        secondH3: "Salida desde la Plaza de La Reina, Valencia.",
        thirdH3: "Transporte privado a La Vall d'Uixó (Castellón).",
        fourthH3: "Tour guiado: 3h 30m (aprox).",
        fifthH3: "Regreso a Valencia por transporte privado.",
      },
      sanJuanSection6: {
        cardTitle: "TOUR GUIADO",
        cardDescription: "Paquete de viaje a las Cuevas de San José",
        firstH4: "Servicios Incluidos",
        list: [
          { li: "Transporte privado.", index: 1 },
          { li: "Recogida en Valencia y regreso a casa.", index: 2 },
          { li: "Tour guiado de las Cuevas de San José.", index: 3 },
          { li: "Paseo en barca en las Cuevas de San José.", index: 4 },
          { li: "Todos los impuestos y gastos incluidos.", index: 5 },
        ],
        secondH4: "€120",
        secondH4span: "/persona",
        button: "RESERVAR AHORA",
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
    common: {
      bookNow: "Reservar",
      toursMenu: {
        caves: "Cuevas de San José"
      },
    },
    timeline: {
      title: "Qué esperar",
      subtitle: "Itinerario",
      steps: [
        {
          title: "Punto de encuentro",
          description: "Saldremos desde Valencia (máximo 4 personas) desplazándonos en coche durante aproximadamente 40 minutos hasta la población de La Vall D'uixo (Castellón)."
        },
        {
          title: "Llegada a las Cuevas",
          description: "Una vez allí empezaremos el recorrido dentro de la cueva que durará unos 40 minutos a una temperatura constante de 20°."
        },
        {
          title: "Exploración",
          description: "El recorrido consta de 800 metros en barca y 250 metros a pie. No existe ningún riesgo ni situación peligrosa en la visita."
        },
        {
          title: "Experiencia única",
          description: "Atrévete a disfrutar algo diferente y especial. Siente la sensación de que el tiempo se ha parado en una atmósfera muy especial."
        },
        {
          title: "Regreso",
          description: "Al terminar la visita volveremos a Valencia al punto de partida"
        }
      ]
    },
    accessibility: {
      title: "Accesibilidad",
      wheelchairAccess: "No es accesible para sillas de ruedas",
      babySeating: "Los bebés deben sentarse en el regazo",
      helpText: "Si tiene alguna pregunta sobre la accesibilidad, estaremos encantados de ayudarle. Solo tiene que llamar al siguiente número e indicar el código del producto: 482538P1",
      phoneNumber: "+34 91 177 6743"
    },
    additionalInfo: {
      title: "Información adicional",
      confirmation: "La confirmación se recibirá en el momento de la reserva",
      participation: "La mayoría de los viajeros pueden participar en la experiencia",
      weatherDependent: "La experiencia requiere buenas condiciones climáticas. Si se cancela debido al mal tiempo, se le ofrecerá una fecha alternativa o un reembolso completo",
      minimumRequired: "Se requiere un número mínimo de viajeros para esta experiencia. Si se cancela por no cumplir con este requisito, se le ofrecerá otra fecha/experiencia o un reembolso completo",
      privateActivity: "Este es un tour/actividad privada; solo participará su grupo"
    },
    cancellation: {
      title: "Política de cancelación",
      freeCancellation: "Cancelación gratuita hasta 24 horas antes del inicio de la experiencia para un reembolso completo",
      fullRefund24h: "Para recibir el reembolso íntegro de la experiencia debes cancelarla como mínimo 24 horas antes de que empiece",
      noRefund24h: "Si cancelas la experiencia menos de 24 horas antes de que empiece, no se te devolverá el importe abonado",
      noChanges24h: "No se aceptan cambios dentro de las 24 horas previas al inicio de la experiencia",
      timeZoneNote: "La hora límite se basa en la hora local del lugar de la experiencia",
    },
    indexSection6: {
      title: "Información Importante",
      accessibility: {
        title: "Información de Accesibilidad",
        wheelchair: "No es accesible para sillas de ruedas",
        babies: "Los bebés deben sentarse en el regazo"
      },
      additional: {
        title: "Información Adicional",
        confirmation: "La confirmación se recibirá en el momento de la reserva",
        participation: "La mayoría de los viajeros pueden participar en la experiencia",
        weather: "La experiencia requiere buenas condiciones climáticas. Si se cancela debido al mal tiempo, se le ofrecerá una fecha alternativa o un reembolso completo",
        minTravelers: "Se requiere un número mínimo de viajeros para esta experiencia. Si se cancela por no cumplir con este requisito, se le ofrecerá otra fecha/experiencia o un reembolso completo",
        private: "Este es un tour/actividad privada; solo participará su grupo"
      },
      cancellation: {
        title: "Política de Cancelación",
        free: "Cancelación gratuita hasta 24 horas antes del inicio de la experiencia para un reembolso completo",
        noRefund: "Sin reembolso si se cancela menos de 24 horas antes del inicio de la experiencia",
        noChanges: "No se aceptan cambios dentro de las 24 horas previas al inicio de la experiencia",
        deadline: "La fecha límite se basa en la hora local del lugar de la experiencia",
        weather: "Las experiencias que dependen del clima ofrecerán una fecha alternativa o un reembolso completo si se cancelan debido al mal tiempo",
        minParticipants: "Las experiencias que requieren un número mínimo de participantes ofrecerán una fecha/experiencia alternativa o un reembolso completo si se cancelan debido a participantes insuficientes",
        moreDetails: "Para más detalles, consulte la política de cancelación"
      }
    }
  },
};
