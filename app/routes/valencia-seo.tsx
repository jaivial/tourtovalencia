import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLanguageContext } from "../providers/LanguageContext";

// Define metadata for SEO
export const meta: MetaFunction = () => {
  return [
    { title: "Valencia Tourism Guide - Things to Do & See in Valencia, Spain" },
    { name: "description", content: "Discover the best things to do in Valencia, Spain. From city tours to boat trips, find all the top attractions, activities, and places to visit in Valencia." },
    { name: "keywords", content: "valencia tourism, things to do in valencia, valencia tours, valencia activities, valencia attractions, valencia travel guide, valencia spain" },
  ];
};

// Define the loader function to provide data to the component
export const loader = async () => {
  // Extract keywords from the SEO data
  const keywords = [
    "visit valencia", "tour valencia", "what to do in valencia", "what to see in valencia",
    "things to do in valencia", "valencia what to do", "valencia things to do", "to do in valencia",
    "what to do valencia", "what to visit in valencia", "valencia tourist", "places to visit valencia",
    "valencia things to do and see", "stuff to do in valencia", "tour to valencia",
    "valencia what to do and see", "what to visit valencia", "things to do and see in valencia",
    "spain valencia things to do", "secret valencia", "activities in valencia", "excursions valencia",
    "valencia trip", "valencia boat trip", "boat tour valencia", "city tour valencia",
    "valencia what to see", "best things to do in valencia", "valencia trips", "valencia places to visit",
    "top things to do in valencia", "walking tours valencia", "top 10 things to do in valencia",
    "valencia top things to do", "day tours valencia", "top things to do valencia",
    "where to visit in valencia", "top ten things to do in valencia", "10 best things to do in valencia",
    "best place to visit in valencia", "valencia tourist places", "what is there to see in valencia",
    "cool things to do in valencia", "discover valencia", "guided tour valencia", "tours in valencia",
    "valencia caves tour", "valencia travel guide", "valencia tour guide", "tours from valencia",
    "cave tour valencia", "valencia city tour", "private tour valencia", "boat tour valencia spain",
    "tour of valencia", "mediterranean cruise excursions", "boat trips in valencia",
    "valencia shore excursions", "visit valència", "private boat tour valencia",
    "what is there to do in valencia", "fun things to do in valencia", "valencia top 10 things to do",
    "10 things to do in valencia", "valencia best things to do", "what to do in valencia today",
    "things to do near valencia", "activities to do in valencia", "valencia history tour",
    "what to do in valencia in october", "valencia visit places", "things to do around valencia",
    "what can you do in valencia", "valencia what to do today", "valencia what to see around",
    "what to do and see in valencia", "what to do around valencia", "what to do at night in valencia",
    "what to do in valencia at night", "what to do in valencia in april", "what to do in valencia in december",
    "what to do in valencia in february", "what to do in valencia in march", "what to do in valencia in november",
    "what to do in valencia on a sunday", "what to do in valencia tonight", "what to do near valencia",
    "what to do on sunday in valencia", "what to see around valencia", "what to see in valencia old town",
    "what to see near valencia", "what to visit around valencia", "what to visit near valencia",
    "things to do in valencia today", "top 5 things to do in valencia", "best activities in valencia",
    "fun activities in valencia", "fun activities valencia", "fun things to do valencia",
    "the best things to do in valencia", "things to do in valencia city centre", "things to see near valencia",
    "top 10 things to do valencia", "unique things to do in valencia", "valencia 10 things to do",
    "valencia activities to do", "valencia fun things to do", "valencia things to do around"
  ];

  // Add language-specific content
  const content = {
    en: {
      title: "Discover Valencia",
      subtitle: "Explore the best things to do, see, and experience in this beautiful Spanish city",
      exploreButton: "Explore Valencia",
      sectionTitle: "Everything You Need to Know About Valencia",
      sectionSubtitle: "From the City of Arts and Sciences to the historic old town, discover all the amazing experiences Valencia has to offer.",
      paragraph1: "Valencia, Spain's third-largest city, offers a perfect blend of historical charm and modern innovation. When you visit Valencia, you'll discover a city that seamlessly combines centuries-old architecture with futuristic designs like the City of Arts and Sciences.",
      paragraph2: "Looking for things to do in Valencia? The options are endless! From exploring the historic old town with its magnificent Valencia Cathedral to taking a boat tour along the Mediterranean coast, there's something for everyone. The top things to do in Valencia include visiting the Central Market, strolling through the Turia Gardens, and experiencing the vibrant nightlife.",
      paragraph3: "For those interested in guided experiences, Valencia tours provide expert insights into the city's rich history and culture. Walking tours in Valencia take you through narrow medieval streets, while city tours showcase both historic and modern attractions. If you're looking for something unique, consider a Valencia caves tour or explore the surrounding areas with day tours from Valencia.",
      paragraph4: "Valencia places to visit extend beyond the city center. The Albufera Natural Park offers a peaceful escape, while the beaches of El Cabanyal and La Malvarrosa provide perfect spots for relaxation. For the best activities in Valencia, don't miss the opportunity to learn how to make authentic paella, visit the Valencia Bioparc, or attend a Valencia CF football match at Mestalla Stadium.",
      paragraph5: "Whether you're planning what to do in Valencia today or organizing a longer trip, this Valencia travel guide will help you discover the best this Mediterranean gem has to offer. From secret Valencia spots known only to locals to the most popular tourist attractions, your Valencia experience will be unforgettable.",
      ctaTitle: "Ready to Experience Valencia?",
      ctaSubtitle: "Book your tour today and discover all the amazing things Valencia has to offer.",
      ctaButton: "Book Your Tour"
    },
    es: {
      title: "Descubre Valencia",
      subtitle: "Explora las mejores cosas que hacer, ver y experimentar en esta hermosa ciudad española",
      exploreButton: "Explorar Valencia",
      sectionTitle: "Todo lo que necesitas saber sobre Valencia",
      sectionSubtitle: "Desde la Ciudad de las Artes y las Ciencias hasta el casco histórico, descubre todas las experiencias increíbles que Valencia tiene para ofrecer.",
      paragraph1: "Valencia, la tercera ciudad más grande de España, ofrece una mezcla perfecta de encanto histórico e innovación moderna. Cuando visites Valencia, descubrirás una ciudad que combina perfectamente la arquitectura centenaria con diseños futuristas como la Ciudad de las Artes y las Ciencias.",
      paragraph2: "¿Buscas cosas que hacer en Valencia? ¡Las opciones son infinitas! Desde explorar el casco antiguo con su magnífica Catedral de Valencia hasta realizar un tour en barco por la costa mediterránea, hay algo para todos. Las mejores cosas que hacer en Valencia incluyen visitar el Mercado Central, pasear por los Jardines del Turia y experimentar la vibrante vida nocturna.",
      paragraph3: "Para aquellos interesados en experiencias guiadas, los tours por Valencia ofrecen conocimientos expertos sobre la rica historia y cultura de la ciudad. Los tours a pie en Valencia te llevan por estrechas calles medievales, mientras que los tours por la ciudad muestran atracciones tanto históricas como modernas. Si buscas algo único, considera un tour por las cuevas de Valencia o explora los alrededores con excursiones de un día desde Valencia.",
      paragraph4: "Los lugares para visitar en Valencia se extienden más allá del centro de la ciudad. El Parque Natural de la Albufera ofrece un escape tranquilo, mientras que las playas de El Cabanyal y La Malvarrosa proporcionan lugares perfectos para relajarse. Para las mejores actividades en Valencia, no te pierdas la oportunidad de aprender a hacer auténtica paella, visitar el Bioparc de Valencia o asistir a un partido de fútbol del Valencia CF en el Estadio Mestalla.",
      paragraph5: "Ya sea que estés planeando qué hacer en Valencia hoy o organizando un viaje más largo, esta guía de viaje de Valencia te ayudará a descubrir lo mejor que esta joya mediterránea tiene para ofrecer. Desde lugares secretos de Valencia conocidos solo por los locales hasta las atracciones turísticas más populares, tu experiencia en Valencia será inolvidable.",
      ctaTitle: "¿Listo para experimentar Valencia?",
      ctaSubtitle: "Reserva tu tour hoy y descubre todas las cosas increíbles que Valencia tiene para ofrecer.",
      ctaButton: "Reservar tu Tour"
    }
  };

  return json({ keywords, content });
};

export default function ValenciaSEO() {
  const { content } = useLoaderData<typeof loader>();
  const { state } = useLanguageContext();
  const currentLanguage = state.currentLanguage === "English" ? "en" : "es";
  const text = content[currentLanguage as keyof typeof content];
  
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect to handle scroll position
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setIsScrolled(position > 50);
    };
    
    handleScroll(); // Initial check
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Hero Section - Adjusted for nav height */}
      <section className={`relative h-[100vh] overflow-hidden ${isScrolled ? 'pt-[100px]' : ''}`}>
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1583265101492-bfe6ef35cef8?q=80&w=4000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Valencia City of Arts and Sciences" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center pt-[120px]">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg"
          >
            {text.title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white max-w-3xl drop-shadow-md"
          >
            {text.subtitle}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8"
          >
            <a 
              href="#explore" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-medium transition-colors duration-300 inline-flex items-center gap-2"
            >
              {text.exploreButton}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Content Section with SEO Keywords integrated into coherent text */}
      <section id="explore" className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {text.sectionTitle}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {text.sectionSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1602597421452-64682dc51a71?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Valencia Old Town" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {currentLanguage === "en" ? "Historic Valencia" : "Valencia Histórica"}
                </h3>
                <p className="text-gray-700 mb-4">
                  {text.paragraph1}
                </p>
                <p className="text-gray-700">
                  {text.paragraph2}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1595242797386-d1405ae6dc77?q=80&w=4374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Valencia Tours" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {currentLanguage === "en" ? "Guided Experiences" : "Experiencias Guiadas"}
                </h3>
                <p className="text-gray-700 mb-4">
                  {text.paragraph3}
                </p>
                <p className="text-gray-700">
                  {text.paragraph4}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            {currentLanguage === "en" ? "Plan Your Visit" : "Planifica Tu Visita"}
          </h3>
          <p className="text-gray-700 text-lg max-w-4xl mx-auto">
            {text.paragraph5}
          </p>
        </motion.div>

        {/* Comprehensive SEO Text Section - replacing keyword cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="bg-white rounded-xl p-8 shadow-xl"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {currentLanguage === "en" ? "Complete Valencia Travel Guide" : "Guía Completa de Viaje a Valencia"}
          </h3>
          <div className="text-gray-700 text-lg space-y-6">
            {currentLanguage === "en" ? (
              <>
                <p>
                  When you <strong>visit Valencia</strong>, you&apos;ll discover why it&apos;s one of Spain&apos;s most beloved destinations. Whether you&apos;re looking for a <strong>Valencia trip</strong> filled with cultural experiences or seeking <strong>fun things to do in Valencia</strong>, this Mediterranean gem offers endless possibilities. <strong>Top things to do in Valencia</strong> include exploring the futuristic City of Arts and Sciences, wandering through the historic old town, and enjoying the beautiful beaches.
                </p>
                <p>
                  For those interested in guided experiences, a <strong>tour Valencia</strong> package or <strong>walking tours Valencia</strong> can provide expert insights into the city&apos;s rich history. <strong>City tour Valencia</strong> options showcase both the historic and modern attractions, while <strong>boat tour Valencia</strong> experiences offer unique perspectives from the water. <strong>Private tour Valencia</strong> services are perfect for those seeking personalized attention, and <strong>day tours Valencia</strong> can take you to nearby attractions.
                </p>
                <p>
                  Wondering <strong>what to do in Valencia</strong> or <strong>what to see in Valencia</strong>? The list is extensive! <strong>Valencia places to visit</strong> include the magnificent Cathedral, the Central Market, and the Turia Gardens. For <strong>what to do at night in Valencia</strong>, the vibrant Ruzafa neighborhood offers excellent dining and nightlife. <strong>What to do in Valencia today</strong> might include visiting the Bioparc, exploring the <strong>Valencia tourist</strong> attractions in the old town, or relaxing at one of the city beaches.
                </p>
                <p>
                  <strong>Best things to do in Valencia</strong> for culture enthusiasts include visiting museums and galleries, while adventure seekers might enjoy <strong>Valencia boat trip</strong> excursions or <strong>Valencia caves tour</strong> experiences. <strong>Secret Valencia</strong> spots known mainly to locals include hidden plazas and authentic tapas bars away from the main tourist areas. <strong>Unique things to do in Valencia</strong> include learning to make authentic paella or exploring the Albufera Natural Park.
                </p>
                <p>
                  For seasonal visitors, there are specific recommendations for <strong>what to do in Valencia in April</strong>, <strong>what to do in Valencia in October</strong>, or any other month. <strong>Things to do near Valencia</strong> include visiting charming coastal towns and exploring the picturesque countryside. Whether you're seeking <strong>activities in Valencia</strong> for families, couples, or solo travelers, this <strong>Valencia travel guide</strong> covers all the essentials for an unforgettable experience in this beautiful Spanish city.
                </p>
              </>
            ) : (
              <>
                <p>
                  Cuando <strong>visites Valencia</strong>, descubrirás por qué es uno de los destinos más queridos de España. Ya sea que estés buscando un <strong>viaje a Valencia</strong> lleno de experiencias culturales o buscando <strong>cosas divertidas que hacer en Valencia</strong>, esta joya mediterránea ofrece posibilidades infinitas. Las <strong>mejores cosas que hacer en Valencia</strong> incluyen explorar la futurista Ciudad de las Artes y las Ciencias, pasear por el casco antiguo histórico y disfrutar de las hermosas playas.
                </p>
                <p>
                  Para aquellos interesados en experiencias guiadas, un paquete de <strong>tour por Valencia</strong> o <strong>tours a pie por Valencia</strong> pueden proporcionar conocimientos expertos sobre la rica historia de la ciudad. Las opciones de <strong>tour por la ciudad de Valencia</strong> muestran atracciones tanto históricas como modernas, mientras que las experiencias de <strong>tour en barco por Valencia</strong> ofrecen perspectivas únicas desde el agua. Los servicios de <strong>tour privado por Valencia</strong> son perfectos para aquellos que buscan atención personalizada, y las <strong>excursiones de un día desde Valencia</strong> pueden llevarte a atracciones cercanas.
                </p>
                <p>
                  ¿Te preguntas <strong>qué hacer en Valencia</strong> o <strong>qué ver en Valencia</strong>? ¡La lista es extensa! Los <strong>lugares para visitar en Valencia</strong> incluyen la magnífica Catedral, el Mercado Central y los Jardines del Turia. Para <strong>qué hacer por la noche en Valencia</strong>, el vibrante barrio de Ruzafa ofrece excelentes opciones de restaurantes y vida nocturna. <strong>Qué hacer en Valencia hoy</strong> podría incluir visitar el Bioparc, explorar las atracciones <strong>turísticas de Valencia</strong> en el casco antiguo o relajarse en una de las playas de la ciudad.
                </p>
                <p>
                  Las <strong>mejores cosas que hacer en Valencia</strong> para los entusiastas de la cultura incluyen visitar museos y galerías, mientras que los buscadores de aventuras podrían disfrutar de excursiones en <strong>barco por Valencia</strong> o experiencias de <strong>tour por las cuevas de Valencia</strong>. Los lugares de <strong>Valencia secreta</strong> conocidos principalmente por los locales incluyen plazas escondidas y auténticos bares de tapas alejados de las principales zonas turísticas. Las <strong>cosas únicas que hacer en Valencia</strong> incluyen aprender a hacer auténtica paella o explorar el Parque Natural de la Albufera.
                </p>
                <p>
                  Para visitantes de temporada, hay recomendaciones específicas para <strong>qué hacer en Valencia en abril</strong>, <strong>qué hacer en Valencia en octubre</strong>, o cualquier otro mes. Las <strong>cosas que hacer cerca de Valencia</strong> incluyen visitar encantadores pueblos costeros y explorar el pintoresco campo. Ya sea que estés buscando <strong>actividades en Valencia</strong> para familias, parejas o viajeros solitarios, esta <strong>guía de viaje de Valencia</strong> cubre todos los elementos esenciales para una experiencia inolvidable en esta hermosa ciudad española.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="bg-blue-600 py-16 text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{text.ctaTitle}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {text.ctaSubtitle}
          </p>
          <a 
            href="/book" 
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-medium transition-colors duration-300 inline-flex items-center gap-2"
          >
            {text.ctaButton}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </motion.section>
    </div>
  );
} 