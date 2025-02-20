import { useState } from "react";
import { PaymentModal } from "~/components/ui/PaymentModal";
import { Button } from "~/components/ui/button";
import PaymentOptions from "~/components/ui/paypalpaymentoptions";
import { useBooking } from "~/context/BookingContext";

export const BookingPaymentModalFeature = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { formData } = useBooking();

  const handleOpen = () => {
    // Validate that we have all required booking data
    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.date || !formData.partySize) {
      console.error("Missing required booking data");
      return;
    }
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <Button onClick={handleOpen} className="w-full bg-primary hover:bg-primary/90 text-white">
        Book Now
      </Button>

      <PaymentModal isOpen={isOpen} onClose={handleClose}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Complete Your Booking</h2>
            <p className="text-muted-foreground mt-2">Your total amount: €{formData.partySize * 120}</p>
          </div>
          <PaymentOptions />
        </div>
      </PaymentModal>
    </>
  );
};
