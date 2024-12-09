// data to generate the nav links
 export type NavType = {
    path: string;
    linkText: string;
 }

 export const NavData: NavType[] = [
    { path: "/", linkText: "Inicio"},
    { path: "/viajeenbarca", linkText: "Viaje en Barca"},
    { path: "/cuevasdesanjuan", linkText: "Cuevas de San Juan"},
    { path: "/conoceme", linkText: "Conóceme"},
    { path: "/reservar", linkText: "Reservar"},
 ]