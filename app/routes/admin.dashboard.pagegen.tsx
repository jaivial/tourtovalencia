import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import PageTemplate from "~/components/_pagegen/PageTemplate";
import { usePageGenerator } from "./admin.dashboard.pagegen.hooks";

export default function PageGeneratorRoute() {
  const {
    step,
    pageName,
    status,
    section1Data,
    section2Data,
    section3Data,
    section4Data,
    section5Data,
    indexSection5Data,
    handleIndexSection5Update,
    setPageName,
    setStatus,
    handleNext,
    handleBack,
    handleSection1Update,
    handleSection1ImageUpdate,
    handleSection1ImageRemove,
    handleSection2Update,
    handleSection2ImageUpdate,
    handleSection2ImageRemove,
    handleSection3ImageUpdate,
    handleSection3ImageRemove,
    handleSection4Update,
    handleSection5Update,
  } = usePageGenerator();

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-8">
      {step === 'name' ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-4">Nombre de la página</h2>
          <input
            type="text"
            value={pageName}
            onChange={(e) => setPageName(e.target.value.replace(/\s+/g, '_'))}
            placeholder="Nombre de la página (sin espacios)"
            className="w-full p-2 border rounded mb-4"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <label className="font-medium">Estado:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'upcoming')}
                className="p-2 border rounded"
              >
                <option value="active">Activo</option>
                <option value="upcoming">Próximamente</option>
              </select>
            </div>
            <Button onClick={handleNext} disabled={!pageName.trim()}>
              Siguiente
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative"
        >
          <Button onClick={handleBack} className="absolute top-4 left-4 z-10">
            Volver
          </Button>
          <PageTemplate
            status={status}
            section1Data={section1Data}
            onSection1Update={handleSection1Update}
            onSection1ImageUpdate={handleSection1ImageUpdate}
            onSection1ImageRemove={handleSection1ImageRemove}
            section2Data={section2Data}
            onSection2Update={handleSection2Update}
            onSection2ImageUpdate={handleSection2ImageUpdate}
            onSection2ImageRemove={handleSection2ImageRemove}
            section3Data={section3Data}
            onSection3ImageUpdate={handleSection3ImageUpdate}
            onSection3ImageRemove={handleSection3ImageRemove}
            section4Data={section4Data}
            onSection4Update={handleSection4Update}
            section5Data={section5Data}
            onSection5Update={handleSection5Update}
            indexSection5Data={indexSection5Data}
            onIndexSection5Update={handleIndexSection5Update}
          />
        </motion.div>
      )}
    </div>
  );
}
