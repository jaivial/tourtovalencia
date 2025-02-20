import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import type { Booking } from "~/types/booking";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

interface BookingSuccessUIProps {
  booking: Booking;
  emailStatus: "idle" | "sending" | "sent" | "error";
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

const iconVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: 0.2,
    },
  },
};

export const BookingSuccessUI = ({ booking, emailStatus }: BookingSuccessUIProps) => {
  return (
    <motion.div className="container mx-auto mt-32 px-4 py-12 max-w-2xl" initial="hidden" animate="visible" variants={containerVariants}>
      <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-2 border-green-100">
        <CardHeader className="text-center space-y-2 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg border-b pb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1),transparent)] animate-pulse" />
          <motion.div variants={iconVariants}>
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardTitle className="text-4xl font-bold text-green-700 mb-2">¡Reserva Confirmada!</CardTitle>
            <CardDescription className="text-xl text-green-600">Gracias por reservar con Tour Tour Valencia</CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="pt-8 px-8">
          <motion.div
            className="space-y-6"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            <motion.div className="bg-slate-50/80 backdrop-blur-sm p-8 rounded-xl border border-slate-200 shadow-inner" variants={itemVariants}>
              <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <span>Detalles de la Reserva</span>
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Nombre", value: booking.fullName },
                  { label: "Email", value: booking.email },
                  {
                    label: "Fecha",
                    value: format(new Date(booking.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
                  },
                  { label: "Personas", value: booking.partySize },
                  {
                    label: "Total",
                    value: `€${booking.amount.toFixed(2)}`,
                    highlight: true,
                  },
                ].map((item, index) => (
                  <motion.div key={item.label} className="grid grid-cols-[140px,1fr] gap-4 items-center border-b border-slate-100 pb-4 last:border-0 last:pb-0" variants={itemVariants} custom={index}>
                    <span className="text-slate-500 font-medium">{item.label}:</span>
                    <span className={`font-semibold ${item.highlight ? "text-xl text-green-700" : "text-slate-700"}`}>{item.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div className="space-y-3" variants={itemVariants}>
              <Alert className="bg-green-50 border-green-200 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <AlertDescription className="text-green-700">
                  Se ha enviado un email de confirmación a <span className="font-medium">{booking.email}</span>
                </AlertDescription>
              </Alert>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
