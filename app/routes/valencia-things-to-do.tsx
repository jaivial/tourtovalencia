import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

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

  return json({ keywords });
};

export default function ValenciaSEO() {
  const { keywords } = useLoaderData<typeof loader>();
  const [visibleKeywords, setVisibleKeywords] = useState<string[]>([]);

  // Effect to gradually reveal keywords for a staggered animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleKeywords(keywords);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [keywords]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1558642084-fd07fae5282e?q=80&w=2000&auto=format&fit=crop" 
            alt="Valencia City of Arts and Sciences" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg"
          >
            Discover Valencia
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white max-w-3xl drop-shadow-md"
          >
            Explore the best things to do, see, and experience in this beautiful Spanish city
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
              Explore Valencia
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Keywords Section */}
      <section id="explore" className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Everything You Need to Know About Valencia
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From the City of Arts and Sciences to the historic old town, discover all the amazing experiences Valencia has to offer.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleKeywords.map((keyword, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: index % 10 * 0.05, // Stagger the animations
              }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <p className="text-gray-800 font-medium capitalize">
                {keyword}
              </p>
            </motion.div>
          ))}
        </div>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Valencia?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Book your tour today and discover all the amazing things Valencia has to offer.
          </p>
          <a 
            href="/book" 
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-medium transition-colors duration-300 inline-flex items-center gap-2"
          >
            Book Your Tour
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </motion.section>
    </div>
  );
} 