import { Booking } from "~/types/booking";
import { Button } from "./button";

interface BookingSuccessUIProps {
  booking: Booking;
}

export const BookingSuccessUI = ({ booking }: BookingSuccessUIProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Reserva Confirmada!
          </h1>
          <p className="text-gray-600">
            Gracias por tu reserva. Hemos enviado un email de confirmación a {booking.email}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Detalles de la Reserva
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nombre</dt>
              <dd className="mt-1 text-sm text-gray-900">{booking.fullName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Fecha</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(booking.bookingDate).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Número de Personas</dt>
              <dd className="mt-1 text-sm text-gray-900">{booking.partySize}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Pagado</dt>
              <dd className="mt-1 text-sm text-gray-900">
                €{(booking.amount / 100).toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8">
          <Button 
            asChild
            className="w-full"
          >
            <a href="/">
              Volver al Inicio
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
