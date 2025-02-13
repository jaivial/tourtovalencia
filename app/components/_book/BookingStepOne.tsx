import { useBooking } from "~/context/BookingContext";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const BookingStepOne = () => {
  const { formData, setFormData, errors } = useBooking();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          className={errors.fullName ? "border-red-500" : ""}
        />
        {errors.fullName && (
          <p className="text-sm text-red-500">{errors.fullName}</p>
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
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
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
          className={errors.emailConfirm ? "border-red-500" : ""}
        />
        {errors.emailConfirm && (
          <p className="text-sm text-red-500">{errors.emailConfirm}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Enter your phone number"
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone}</p>
        )}
      </div>
    </div>
  );
}; 