import { useBooking } from "~/context/BookingContext";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function BookingStepOne() {
  const { formData, errors, handleInputChange } = useBooking();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailConfirm">Confirm Email</Label>
        <Input
          id="emailConfirm"
          name="emailConfirm"
          type="email"
          value={formData.emailConfirm}
          onChange={handleInputChange}
          placeholder="Confirm your email"
          className={errors.emailConfirm ? "border-destructive" : ""}
        />
        {errors.emailConfirm && (
          <p className="text-sm text-destructive">{errors.emailConfirm}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="Enter your phone number"
          className={errors.phoneNumber ? "border-destructive" : ""}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{errors.phoneNumber}</p>
        )}
      </div>
    </div>
  );
}