import { Button } from "~/components/ui/button";
import { Link, useNavigate } from "@remix-run/react";
import { CheckCircle, Home, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import type { Booking } from "~/types/booking";

interface BookingSuccessProps {
  booking?: Booking;
}

export const BookingSuccess = ({ booking }: BookingSuccessProps) => {
  const [countdown, setCountdown] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown === 0) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <div className="max-w-2xl mx-auto p-6 mt-56 mb-36 rounded-lg">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">
            Thank You for Your Booking!
          </h1>
          <p className="text-muted-foreground">
            We&apos;ve received your request and sent a confirmation email to your inbox.
          </p>
        </div>

        {booking && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-left shadow-sm">
            <h2 className="font-medium text-gray-800 mb-4 text-lg">Booking Details:</h2>
            <dl className="grid grid-cols-1 gap-3 text-sm">
              {booking.tourName && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <dt className="font-medium text-gray-600">Tour:</dt>
                  <dd className="text-gray-900">{booking.tourName}</dd>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-gray-100">
                <dt className="font-medium text-gray-600">Date:</dt>
                <dd className="text-gray-900">{new Date(booking.date).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <dt className="font-medium text-gray-600">Party Size:</dt>
                <dd className="text-gray-900">{booking.partySize} people</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <dt className="font-medium text-gray-600">Total Paid:</dt>
                <dd className="text-gray-900">€{(booking.amount / 100).toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-left">
          <h2 className="font-medium text-yellow-800 mb-3">Next Steps:</h2>
          <ul className="text-sm text-yellow-700 space-y-3">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Check your email for booking details
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Wait for our confirmation via WhatsApp or email
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              We&apos;ll contact you within 24 hours
            </li>
          </ul>
        </div>

        <div className="text-sm text-muted-foreground">
          Redirecting to homepage in {countdown} seconds...
        </div>

        <div className="flex gap-4 justify-center pt-2">
          <Button asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}; 