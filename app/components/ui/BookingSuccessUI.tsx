import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import type { Booking } from "~/types/booking";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BookingSuccessUIProps {
  booking: Booking;
  emailStatus: 'idle' | 'sending' | 'sent' | 'error';
}

export const BookingSuccessUI = ({ booking, emailStatus }: BookingSuccessUIProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>¡Reserva Confirmada!</CardTitle>
          <CardDescription>
            Gracias por reservar con Excursiones Medina Azahara
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Detalles de la Reserva:</h3>
              <p>Nombre: {booking.fullName}</p>
              <p>Email: {booking.email}</p>
              <p>Fecha: {format(new Date(booking.date), "EEEE, d 'de' MMMM 'de' yyyy", {
                locale: es,
              })}</p>
              <p>Número de Personas: {booking.partySize}</p>
              <p>Total: €{(booking.amount / 100).toFixed(2)}</p>
            </div>

            <div className="mt-4">
              {emailStatus === 'sending' && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Enviando confirmación por email...
                  </AlertDescription>
                </Alert>
              )}
              
              {emailStatus === 'sent' && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    Se ha enviado un email de confirmación a {booking.email}
                  </AlertDescription>
                </Alert>
              )}
              
              {emailStatus === 'error' && (
                <Alert>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription>
                    No se pudo enviar el email de confirmación. Por favor, guarde esta página como referencia.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
