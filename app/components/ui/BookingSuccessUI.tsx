import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import type { Booking } from "~/types/booking";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BookingSuccessUIProps {
  booking: Booking;
  emailStatus: "idle" | "sending" | "sent" | "error";
}

export const BookingSuccessUI = ({ booking, emailStatus }: BookingSuccessUIProps) => {
  return (
    <div className="container mx-auto mt-40 px-4 py-12 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center space-y-2 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg border-b pb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-2" />
          <CardTitle className="text-3xl font-bold text-green-700">¡Reserva Confirmada!</CardTitle>
          <CardDescription className="text-lg text-green-600">Gracias por reservar con Tour Tour Valencia</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 px-8">
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span>Detalles de la Reserva</span>
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-[120px,1fr] gap-2 items-center">
                  <span className="text-slate-500">Nombre:</span>
                  <span className="font-medium">{booking.fullName}</span>
                </div>
                <div className="grid grid-cols-[120px,1fr] gap-2 items-center">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium">{booking.email}</span>
                </div>
                <div className="grid grid-cols-[120px,1fr] gap-2 items-center">
                  <span className="text-slate-500">Fecha:</span>
                  <span className="font-medium">
                    {format(new Date(booking.date), "EEEE, d 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-[120px,1fr] gap-2 items-center">
                  <span className="text-slate-500">Personas:</span>
                  <span className="font-medium">{booking.partySize}</span>
                </div>
                <div className="grid grid-cols-[120px,1fr] gap-2 items-center">
                  <span className="text-slate-500">Total:</span>
                  <span className="font-medium text-lg text-green-700">€{booking.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {emailStatus === "sending" && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                  <AlertDescription className="text-blue-700">Enviando confirmación por email...</AlertDescription>
                </Alert>
              )}

              {emailStatus === "sent" && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <AlertDescription className="text-green-700">
                    Se ha enviado un email de confirmación a <span className="font-medium">{booking.email}</span>
                  </AlertDescription>
                </Alert>
              )}

              {emailStatus === "error" && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <AlertDescription className="text-red-700">Hubo un error al enviar el email de confirmación. Por favor, guarde esta página para su referencia.</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
