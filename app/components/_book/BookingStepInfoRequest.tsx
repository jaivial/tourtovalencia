import { Alert, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useBooking } from "~/context/BookingContext";
import {
  buildWhatsAppUrl,
  hasValidEmailInfoRequestContact,
} from "~/utils/whatsapp";

interface BookingStepInfoRequestProps {
  text: {
    description: string;
    missingContact: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    placeholders: {
      fullName: string;
      email: string;
      phoneNumber: string;
    };
  };
}

export const BookingStepInfoRequest = ({ text }: BookingStepInfoRequestProps) => {
  const { selectedTour, formData, errors, handleInputChange } = useBooking();
  const contact = selectedTour?.infoRequestContact;
  const infoRequestUrl = buildWhatsAppUrl(selectedTour?.infoRequestContact);
  const hasPhoneContact = contact?.enablePhone ? Boolean(infoRequestUrl) : false;
  const hasEmailContact = contact?.enableEmail ? hasValidEmailInfoRequestContact(contact) : false;
  const hasAnyAvailableChannel = hasPhoneContact || hasEmailContact;

  return (
    <div className="space-y-4">
      <p className="text-base text-center text-foreground">{text.description}</p>

      {!hasAnyAvailableChannel && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-700">{text.missingContact}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="infoRequestFullName">{text.fullName}</Label>
        <Input
          id="infoRequestFullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder={text.placeholders.fullName}
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="infoRequestEmail">{text.email}</Label>
        <Input
          id="infoRequestEmail"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder={text.placeholders.email}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="infoRequestPhone">{text.phoneNumber}</Label>
        <Input
          id="infoRequestPhone"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder={text.placeholders.phoneNumber}
          className={errors.phoneNumber ? "border-destructive" : ""}
        />
        {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
      </div>
    </div>
  );
};
