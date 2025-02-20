import { useState, useEffect } from "react";
import { PaymentModal } from "~/components/ui/PaymentModal";
import { Button } from "~/components/ui/button";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PaymentOptions from "~/routes/book.paypal";
import { useMatches } from "@remix-run/react";
import type { RootLoaderData } from "~/root";

export const PaymentModalFeature = ({ paypalClientId }: { paypalClientId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const matches = useMatches();

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  if (!paypalClientId) {
    console.error("PayPal Client ID is not configured");
    return null;
  }

  return (
    <>
      <Button onClick={handleOpen} className="bg-primary hover:bg-primary/90 text-white">
        Book now
      </Button>

      <PaymentModal isOpen={isOpen} onClose={handleClose}>
        <PaymentOptions />
      </PaymentModal>
    </>
  );
};
