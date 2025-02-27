import { useBooking } from "~/context/BookingContext";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CountrySelect } from "../ui/CountrySelect";
import { useLanguageContext } from "~/providers/LanguageContext";

interface BookingStepOneProps {
  bookingStepOneText: {
    fullName: string;
    email: string;
    emailConfirm: string;
    phoneNumber: string;
    country: string;
    placeholders: {
      fullName: string;
      email: string;
      emailConfirm: string;
      phoneNumber: string;
      country: string;
      searchCountry: string;
      noCountryFound: string;
    };
  };
}

export default function BookingStepOne({ bookingStepOneText }: BookingStepOneProps) {
  const { formData, errors, handleInputChange, setFormData } = useBooking();
  const { state } = useLanguageContext();
  const currentLanguage = state.currentLanguage === "English" ? "en" : "es";

  const handleCountryChange = ({ country, countryCode }: { country: string; countryCode: string }) => {
    setFormData({
      ...formData,
      country,
      countryCode
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">{bookingStepOneText.fullName}</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder={bookingStepOneText.placeholders.fullName}
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{bookingStepOneText.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder={bookingStepOneText.placeholders.email}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailConfirm">{bookingStepOneText.emailConfirm}</Label>
        <Input
          id="emailConfirm"
          name="emailConfirm"
          type="email"
          value={formData.emailConfirm}
          onChange={handleInputChange}
          placeholder={bookingStepOneText.placeholders.emailConfirm}
          className={errors.emailConfirm ? "border-destructive" : ""}
        />
        {errors.emailConfirm && (
          <p className="text-sm text-destructive">{errors.emailConfirm}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">{bookingStepOneText.country}</Label>
        <CountrySelect
          value={formData.country || "ES"}
          onChange={handleCountryChange}
          placeholder={bookingStepOneText.placeholders.country}
          searchPlaceholder={bookingStepOneText.placeholders.searchCountry}
          notFoundText={bookingStepOneText.placeholders.noCountryFound}
          language={currentLanguage as 'en' | 'es'}
          className={errors.country ? "border-destructive" : ""}
        />
        {errors.country && (
          <p className="text-sm text-destructive">{errors.country}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">{bookingStepOneText.phoneNumber}</Label>
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-24">
            <Input
              type="text"
              disabled
              value={formData.countryCode || "+34"}
              className="bg-muted"
            />
          </div>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder={bookingStepOneText.placeholders.phoneNumber}
            className={errors.phoneNumber ? "border-destructive" : ""}
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{errors.phoneNumber}</p>
        )}
      </div>
    </div>
  );
}