import { useBooking } from "~/context/BookingContext";
import { format } from "date-fns";
import { Card } from "~/components/ui/card";
import { PaymentFeature } from "../features/PaymentFeature";
import { BookingPaymentModalFeature } from "../features/BookingPaymentModalFeature";
import { 
  User, 
  Mail, 
  Phone, 
  Users, 
  Calendar,
  Receipt,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "@remix-run/react";

export const BookingStepThree = () => {
  const states = useBooking();
  const totalPrice = states.formData.partySize * 120;
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Booking Summary</h2>
      
      <Card className="p-6 space-y-6">
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm pl-6">
            <span className="text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Name:
            </span>
            <span>{states.formData.fullName}</span>
            <span className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email:
            </span>
            <span>{states.formData.email}</span>
            <span className="text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone:
            </span>
            <span>{states.formData.phoneNumber}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Booking Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm pl-6">
            <span className="text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Party Size:
            </span>
            <span>{states.formData.partySize} people</span>
            <span className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date:
            </span>
            <span>
              {states.formData.date
                ? format(new Date(states.formData.date), "PPP")
                : "Not selected"}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Total Price:
            </span>
            <span className="text-2xl font-bold">€{totalPrice}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground pl-7">
            Price calculation: {states.formData.partySize} people × €120 per person
          </p>
        </div>
      </Card>

      {states.paymentClientSecret ? (
        <PaymentFeature />
      ) : (
        <div className="space-y-4">
          <BookingPaymentModalFeature />
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-yellow-800 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                Your booking will be confirmed after successful payment.
                Click "Book Now" to proceed to payment.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};