// data to generate the nav links
 export type NavLink = {
    path: string;
    linkText: string;
 }

 export type NavType =  {
   language: string;
   links: NavLink[];
 }

 export const NavData = [
   {
     language: "spanish",
     links: [
       { path: "/", linkText: "Inicio" },
       { path: "/viajeenbarca", linkText: "Viaje en Barca" },
       { path: "/cuevasdesanjuan", linkText: "Cuevas de San Juan" },
       { path: "/conoceme", linkText: "Conóceme" },
       { path: "/reservar", linkText: "Reservar" },
     ],
   },
   {
     language: "english",
     links: [
       { path: "/", linkText: "Home" },
       { path: "/viajeenbarca", linkText: "Boat Trip" },
       { path: "/cuevasdesanjuan", linkText: "San Juan Caves" },
       { path: "/conoceme", linkText: "About Me" },
       { path: "/reservar", linkText: "Book Now" },
     ],
   },
   {
     language: "russian",
     links: [
       { path: "/", linkText: "Главная" },
       { path: "/viajeenbarca", linkText: "Прогулка на лодке" },
       { path: "/cuevasdesanjuan", linkText: "Пещеры Сан-Хуан" },
       { path: "/conoceme", linkText: "Обо мне" },
       { path: "/reservar", linkText: "Забронировать" },
     ],
   },
   {
     language: "german",
     links: [
       { path: "/", linkText: "Startseite" },
       { path: "/viajeenbarca", linkText: "Bootsfahrt" },
       { path: "/cuevasdesanjuan", linkText: "San Juan Höhlen" },
       { path: "/conoceme", linkText: "Über Mich" },
       { path: "/reservar", linkText: "Buchen" },
     ],
   },
   {
     language: "italian",
     links: [
       { path: "/", linkText: "Home" },
       { path: "/viajeenbarca", linkText: "Giro in Barca" },
       { path: "/cuevasdesanjuan", linkText: "Grotte di San Juan" },
       { path: "/conoceme", linkText: "Chi Sono" },
       { path: "/reservar", linkText: "Prenota" },
     ],
   },
 ];
 