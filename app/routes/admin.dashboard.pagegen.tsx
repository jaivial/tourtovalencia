import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "~/components/ui/button";

export default function PageGeneratorRoute() {
  const [step, setStep] = useState<'options' | 'name'>('options');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const buttonVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 }
  };

  const formVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Generador de páginas</h1>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-6"
      >
        {step === 'options' ? (
          <motion.div
            variants={buttonVariants}
            className="flex flex-col space-y-4"
          >
            <Button
              onClick={() => setStep('name')}
              size="lg"
              className="w-full py-8 text-xl"
            >
              Crear nueva página
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full py-8 text-xl"
            >
              Administrar páginas
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={formVariants}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Nombre de la página</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Ingrese el nombre de la página"
                className="w-full p-3 border rounded-md"
              />
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('options')}
                >
                  Volver
                </Button>
                <Button>
                  Siguiente
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
