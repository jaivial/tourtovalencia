import { useBooking } from "~/context/BookingContext";
import { format } from "date-fns";
import { Card } from "~/components/ui/card";
import { PaymentFeature } from "../features/PaymentFeature";
import { BookingPaymentModalFeature } from "../features/BookingPaymentModalFeature";
import { User, Mail, Phone, Users, Calendar, Receipt, AlertCircle } from "lucide-react";
import { useNavigate } from "@remix-run/react";

export const BookingStepThree = () => {
  const states = useBooking();
  const totalPrice = states.formData.partySize * 120;
  const navigate = useNavigate();
  return (
    <div className="space-y-6 flex flex-col items-center">
      <h2 className="text-2xl font-semibold tracking-tight text-center sm:text-left">Booking Summary</h2>

      <Card className="p-6 space-y-6 w-full max-w-2xl">
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2 justify-center sm:justify-start">
            <User className="h-4 w-4" />
            Personal Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col space-y-1 sm:space-y-0 items-center sm:items-start">
              <span className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Name:
              </span>
              <span className="sm:hidden">{states.formData.fullName}</span>
            </div>
            <span className="hidden sm:block">{states.formData.fullName}</span>
            
            <div className="flex flex-col space-y-1 sm:space-y-0 items-center sm:items-start">
              <span className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email:
              </span>
              <span className="sm:hidden break-all text-center">{states.formData.email}</span>
            </div>
            <span className="hidden sm:block break-all">{states.formData.email}</span>
            
            <div className="flex flex-col space-y-1 sm:space-y-0 items-center sm:items-start">
              <span className="text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone:
              </span>
              <span className="sm:hidden">{states.formData.phoneNumber}</span>
            </div>
            <span className="hidden sm:block">{states.formData.phoneNumber}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2 justify-center sm:justify-start">
            <Calendar className="h-4 w-4" />
            Booking Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col space-y-1 sm:space-y-0 items-center sm:items-start">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Party Size:
              </span>
              <span className="sm:hidden">{states.formData.partySize} people</span>
            </div>
            <span className="hidden sm:block">{states.formData.partySize} people</span>
            
            <div className="flex flex-col space-y-1 sm:space-y-0 items-center sm:items-start">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date:
              </span>
              <span className="sm:hidden">{states.formData.date ? format(new Date(states.formData.date), "PPP") : "Not selected"}</span>
            </div>
            <span className="hidden sm:block">{states.formData.date ? format(new Date(states.formData.date), "PPP") : "Not selected"}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-lg font-medium flex items-center gap-2 justify-center sm:justify-start">
              <Receipt className="h-5 w-5" />
              Total Price:
            </span>
            <span className="text-2xl font-bold text-center sm:text-left">€{totalPrice}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground text-center sm:text-left">Price calculation: {states.formData.partySize} people × €120 per person</p>
        </div>
      </Card>

      {states.paymentClientSecret ? (
        <div className="w-full max-w-2xl">
          <PaymentFeature />
        </div>
      ) : (
        <div className="space-y-4 w-full max-w-2xl">
          {/* <BookingPaymentModalFeature /> */}
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-yellow-800 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Your booking will be confirmed after successful payment. Click "Book Now" to proceed to payment.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
