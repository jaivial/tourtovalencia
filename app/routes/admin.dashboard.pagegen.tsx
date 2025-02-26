import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import PageTemplate from "~/components/_pagegen/PageTemplate";
import { usePageGenerator } from "./admin.dashboard.pagegen.hooks";
import { ArrowLeftIcon, PlusCircleIcon, EditIcon } from "lucide-react";
import { Link, Outlet, useLocation } from "@remix-run/react";

export default function PageGeneratorRoute() {
  const location = useLocation();
  const isExactPagegenRoute = location.pathname === "/admin/dashboard/pagegen";
  
  const {
    step,
    pageName,
    status,
    section1Data,
    section2Data,
    section3Data,
    section4Data,
    section5Data,
    section6Data,
    indexSection5Data,
    timelineData,
    price,
    setPageName,
    handleNext,
    handleBack,
    handleStatusChange,
    handleSection1Update,
    handleSection2Update,
    handleSection3ImageUpdate,
    handleSection3ImageRemove,
    handleSection4Update,
    handleSection5Update,
    handleSection6Update,
    handleIndexSection5Update,
    handleTimelineUpdate,
    handlePriceChange,
    setStep,
  } = usePageGenerator();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  // If we're not on the exact pagegen route, render the child route
  if (!isExactPagegenRoute) {
    return <Outlet />;
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-0 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {step === "name" && (
          <motion.div 
            key="cards"
            variants={containerVariants} 
            initial="hidden" 
            animate="visible" 
            exit="exit" 
            className="max-w-4xl w-full mx-auto p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Gestión de Tours</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Crear Nuevo Tour Card */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                onClick={() => setStep("create")}
              >
                <div className="p-8 flex flex-col items-center justify-center h-64">
                  <PlusCircleIcon className="h-16 w-16 text-blue-500 mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">Crear Nuevo Tour</h3>
                  <p className="text-gray-600 text-center">Diseña y publica un nuevo tour en tu sitio web</p>
                </div>
              </motion.div>

              {/* Editar Tour Card */}
              <Link to="/admin/dashboard/pagegen/editpage" className="block">
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer h-full"
                >
                  <div className="p-8 flex flex-col items-center justify-center h-64">
                    <EditIcon className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">Editar Tour</h3>
                    <p className="text-gray-600 text-center">Modifica tours existentes en tu sitio web</p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}

        {step === "create" && (
          <motion.div 
            key="create-form"
            variants={containerVariants} 
            initial="hidden" 
            animate="visible" 
            exit="exit" 
            className="max-w-3xl w-full mx-auto bg-white rounded-lg shadow-lg p-8"
          >
            <div className="flex justify-start items-center mb-6">
              <Button onClick={() => setStep("name")} variant="outline" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Atrás
              </Button>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Crear Nuevo Tour</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="page-name" className="block text-lg font-medium text-gray-700 mb-2">
                  Nombre del Tour
                </Label>
                <Input id="page-name" value={pageName} onChange={(e) => setPageName(e.target.value)} className="mt-1 block w-full text-lg p-3" placeholder="Ingrese el nombre del tour..." />
              </div>
              <div className="flex justify-end mt-8">
                <Button onClick={handleNext} disabled={!pageName.trim()} className="text-lg px-6 py-3">
                  Siguiente
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "template" && (
          <motion.div 
            key="template"
            variants={containerVariants} 
            initial="hidden" 
            animate="visible" 
            exit="exit" 
            className="w-full"
          >
            <div className="flex justify-start items-center mb-6 px-8 mt-8">
              <Button onClick={handleBack} variant="outline" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Atrás
              </Button>
            </div>

            <div className="w-full">
              <PageTemplate
                status={status}
                onStatusChange={handleStatusChange}
                pageName={pageName}
                price={price}
                onPriceChange={handlePriceChange}
                indexSection5Data={indexSection5Data}
                onIndexSection5Update={handleIndexSection5Update}
                section1Data={section1Data}
                onSection1Update={handleSection1Update}
                section2Data={section2Data}
                onSection2Update={handleSection2Update}
                section3Data={section3Data}
                onSection3ImageUpdate={handleSection3ImageUpdate}
                onSection3ImageRemove={handleSection3ImageRemove}
                section4Data={section4Data}
                onSection4Update={handleSection4Update}
                section5Data={section5Data}
                onSection5Update={handleSection5Update}
                section6Data={section6Data}
                onSection6Update={handleSection6Update}
                timelineData={timelineData}
                onTimelineUpdate={handleTimelineUpdate}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
