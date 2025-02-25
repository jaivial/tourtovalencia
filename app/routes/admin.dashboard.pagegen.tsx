import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
    section6Data,
    indexSection5Data,
    handleIndexSection5Update,
    setPageName,
    handleNext,
    handleBack,
    handleStatusChange,
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
    handleSection6Update,
  } = usePageGenerator();

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-0">
      {step === "name" ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Page</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="page-name" className="block text-sm font-medium text-gray-700">
                Page Name
              </Label>
              <Input id="page-name" value={pageName} onChange={(e) => setPageName(e.target.value)} className="mt-1 block w-full" placeholder="Enter page name..." />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleNext} disabled={!pageName.trim()}>
                Next
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <Button onClick={handleBack} variant="outline">
              Back
            </Button>
            <div className="w-[100px]" /> {/* Spacer for alignment */}
          </div>

          <div className="w-full">
            <PageTemplate
              status={status}
              onStatusChange={handleStatusChange}
              pageName={pageName}
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
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
