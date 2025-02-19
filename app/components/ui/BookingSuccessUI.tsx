import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { Booking } from "~/types/booking";
import { Button } from "./button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BookingSuccessUIProps {
  booking: Booking;
}

export const BookingSuccessUI = ({ booking }: BookingSuccessUIProps) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/");
    }
  }, [countdown, navigate]);

  const handleContinue = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            ¡Reserva Confirmada!
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Gracias por tu reserva. Hemos enviado un email de confirmación a{" "}
            <span className="font-medium">{booking.email}</span>
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Detalles de la Reserva
          </h2>
          <dl className="divide-y divide-gray-200">
            <div className="py-3 flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Nombre</dt>
              <dd className="text-sm text-gray-900">{booking.fullName}</dd>
            </div>
            <div className="py-3 flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Fecha</dt>
              <dd className="text-sm text-gray-900">
                {format(new Date(booking.bookingDate), "EEEE, d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </dd>
            </div>
            <div className="py-3 flex justify-between">
              <dt className="text-sm font-medium text-gray-500">
                Número de Personas
              </dt>
              <dd className="text-sm text-gray-900">{booking.partySize}</dd>
            </div>
            <div className="py-3 flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Total Pagado</dt>
              <dd className="text-sm text-gray-900">
                €{(booking.amount / 100).toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 space-y-4">
          <div className="text-center text-sm text-gray-600">
            Redirigiendo a la página principal en {countdown} segundos...
          </div>
          <Button onClick={handleContinue} className="w-full">
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
};
