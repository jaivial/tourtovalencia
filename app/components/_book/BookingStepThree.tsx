import { useBooking } from "~/context/BookingContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "~/components/ui/card";
import { PaymentFeature } from "../features/PaymentFeature";
import { User, Mail, Phone, Users, Calendar, Receipt, AlertCircle, MapPin, Globe } from "lucide-react";
import { useLanguageContext } from "~/providers/LanguageContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

interface BookingStepThreeProps {
  bookingStepThreeText: {
    bookingSummary: string;
    personalDetails: string;
    bookingDetails: string;
    labels: {
      name: string;
      email: string;
      phone: string;
      partySize: string;
      date: string;
      totalPrice: string;
      tour: string;
      country: string;
    };
    notSelected: string;
    people: string;
    priceCalculation: string;
    paymentMessage: string;
    selectedTour: string;
  };
}

/**
 * Combines multiple class names and merges Tailwind CSS classes
 * @param inputs - Class names to combine
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BookingStepThree = ({ bookingStepThreeText }: BookingStepThreeProps) => {
  const states = useBooking();
  const { selectedTour, formData } = states;
  
  const { state } = useLanguageContext();
  const currentLanguage = state.currentLanguage === "English" ? "en" : "es";
  
  const locale = currentLanguage === "es" ? es : undefined;
  
  const tourPrice = selectedTour?.content?.en?.price || selectedTour?.tourPrice || 120;
  const totalPrice = formData.partySize * tourPrice;

  const tourName = currentLanguage === "en" 
    ? (selectedTour?.content?.en?.title || 
       selectedTour?.tourName?.en || 
       selectedTour?.name || 
       formData.tourSlug || 
       bookingStepThreeText.notSelected)
    : (selectedTour?.content?.es?.title || 
       selectedTour?.tourName?.es || 
       selectedTour?.name || 
       formData.tourSlug || 
       bookingStepThreeText.notSelected);

  const priceCalculation = bookingStepThreeText.priceCalculation
    .replace('{partySize}', formData.partySize.toString())
    .replace('{price}', tourPrice.toString());

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPP", { locale });
    } catch (error) {
      console.error("Error formatting date:", error);
      return bookingStepThreeText.notSelected;
    }
  };

  // Determine country name based on country code in the right language
  const getCountryName = () => {
    // This would normally come from the countries data
    // For this example, we're hardcoding based on common country codes
    const countryMap: Record<string, { en: string, es: string }> = {
      'ES': { en: 'Spain', es: 'España' },
      'US': { en: 'United States', es: 'Estados Unidos' },
      'GB': { en: 'United Kingdom', es: 'Reino Unido' },
      'DE': { en: 'Germany', es: 'Alemania' },
      'FR': { en: 'France', es: 'Francia' }
    };
    
    const country = formData.country || 'ES';
    return countryMap[country]?.[currentLanguage] || country;
  };

  // Get flag emoji based on country code
  const getCountryFlag = () => {
    const country = formData.country || 'ES';
    // Convert country code to flag emoji
    const flagOffset = 127397; // Offset to convert ASCII to regional indicator symbols
    const countryCodePoints = [...country].map(char => char.charCodeAt(0) + flagOffset);
    return String.fromCodePoint(...countryCodePoints);
  };

  return (
    <div className="space-y-6 flex flex-col items-center">
      <h2 className="text-2xl font-semibold tracking-tight text-center sm:text-left">{bookingStepThreeText.bookingSummary}</h2>

      <Card className="p-6 space-y-6 w-full max-w-2xl">
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2 justify-center sm:justify-start">
            <User className="h-4 w-4" />
            {bookingStepThreeText.personalDetails}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col space-y-1 sm:space-y-0 items-center sm:items-start">
              <span className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                {bookingStepThreeText.labels.name}
              </span>
              <span className="sm:hidden">{states.formData.fullName}</span>
            </div>
            <span className="hidden sm:block">{states.formData.fullName}</span>
            
            <div className="flex flex-col space-y-1 sm:space-y-0 items-center sm:items-start">
              <span className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {bookingStepThreeText.labels.email}
              </span>
              <span className="sm:hidden break-all text-center">{states.formData.email}</span>
            </div>
            <span className="hidden sm:block break-all">{states.formData.email}</span>
            
            <div className="flex flex-col space-y-1 sm:space-y-0 items-center sm:items-start">
              <span className="text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {bookingStepThreeText.labels.phone}
              </span>
              <span className="sm:hidden">
                {formData.countryCode && <span className="text-muted-foreground">{formData.countryCode} </span>}
                {states.formData.phoneNumber}
              </span>
            </div>
            <span className="hidden sm:block">
              {formData.countryCode && <span className="text-muted-foreground">{formData.countryCode} </span>}
              {states.formData.phoneNumber}
            </span>
            
            <div className="flex flex-col space-y-1 sm:space-y-0 items-center sm:items-start">
              <span className="text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {bookingStepThreeText.labels.country}
              </span>
              <span className="sm:hidden">{getCountryFlag()} {getCountryName()}</span>
            </div>
            <span className="hidden sm:block">{getCountryFlag()} {getCountryName()}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2 justify-center sm:justify-start">
            <Calendar className="h-4 w-4" />
            {bookingStepThreeText.bookingDetails}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col space-y-1 sm:space-y-0 items-center sm:items-start">
              <span className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {bookingStepThreeText.selectedTour || bookingStepThreeText.labels.tour}
              </span>
              <span className="sm:hidden">{tourName}</span>
            </div>
            <span className="hidden sm:block">{tourName}</span>
            
            <div className="flex flex-col space-y-1 sm:space-y-0 items-center sm:items-start">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                {bookingStepThreeText.labels.partySize}
              </span>
              <span className="sm:hidden">{states.formData.partySize} {bookingStepThreeText.people}</span>
            </div>
            <span className="hidden sm:block">{states.formData.partySize} {bookingStepThreeText.people}</span>
            
            <div className="flex flex-col space-y-1 sm:space-y-0 items-center sm:items-start">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {bookingStepThreeText.labels.date}
              </span>
              <span className="sm:hidden">{states.formData.date ? formatDate(states.formData.date) : bookingStepThreeText.notSelected}</span>
            </div>
            <span className="hidden sm:block">{states.formData.date ? formatDate(states.formData.date) : bookingStepThreeText.notSelected}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-lg font-medium flex items-center gap-2 justify-center sm:justify-start">
              <Receipt className="h-5 w-5" />
              {bookingStepThreeText.labels.totalPrice}
            </span>
            <span className="text-2xl font-bold text-center sm:text-left">{totalPrice}€</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground text-center sm:text-left">{priceCalculation}</p>
        </div>
      </Card>

      {states.paymentClientSecret ? (
        <div className="w-full max-w-2xl">
          <PaymentFeature tourPrice={tourPrice} />
        </div>
      ) : (
        <div className="space-y-4 w-full max-w-2xl">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-yellow-800 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{bookingStepThreeText.paymentMessage}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
