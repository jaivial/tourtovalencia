import { Alert, AlertDescription } from "../ui/alert";
import { useBooking } from "~/context/BookingContext";
import { buildWhatsAppUrl } from "~/utils/whatsapp";

interface BookingStepInfoRequestProps {
  text: {
    description: string;
    missingContact: string;
  };
}

export const BookingStepInfoRequest = ({ text }: BookingStepInfoRequestProps) => {
  const { selectedTour } = useBooking();
  const infoRequestUrl = buildWhatsAppUrl(selectedTour?.infoRequestContact);

  return (
    <div className="space-y-4">
      <p className="text-base text-center text-foreground">{text.description}</p>

      {!infoRequestUrl && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-700">{text.missingContact}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
