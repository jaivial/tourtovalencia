import Stripe from "stripe";
import { BookingFormData } from "~/hooks/book.hooks";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY must be defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

export async function createPaymentIntent(booking: BookingFormData) {
  if (!booking.bookingDate) {
    throw new Error("Booking date is required");
  }

  const totalAmount = booking.partySize * 0.5 * 100; // 0.5 EUR converted to cents

  try {
    // Ensure the date is a string when sending to Stripe
    const bookingDate = booking.bookingDate instanceof Date ? booking.bookingDate.toISOString() : new Date(booking.bookingDate).toISOString();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "eur",
      metadata: {
        bookingDate,
        customerName: booking.fullName,
        customerEmail: booking.email,
        partySize: booking.partySize.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe error: ${error.message}`);
    }
    throw new Error("Failed to create payment intent");
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe error: ${error.message}`);
    }
    throw new Error("Failed to retrieve payment intent");
  }
}

export async function createCheckoutSession(booking: BookingFormData) {
  if (!booking.bookingDate) {
    throw new Error("Booking date is required");
  }

  const totalAmount = booking.partySize * 0.5 * 100; // 0.5 EUR converted to cents

  try {
    // Ensure the date is a string when sending to Stripe
    const bookingDate = booking.bookingDate instanceof Date ? booking.bookingDate.toISOString() : new Date(booking.bookingDate).toISOString();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Excursión a Cuevas de San Jose",
              description: `Reserva para ${booking.partySize} ${booking.partySize === 1 ? "persona" : "personas"} el ${new Date(bookingDate).toLocaleDateString("es-ES")}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.PUBLIC_URL}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_URL}/book?error=payment-cancelled`,
      metadata: {
        bookingDate,
        customerName: booking.fullName,
        customerEmail: booking.email,
        partySize: booking.partySize.toString(),
        phoneNumber: booking.phone || "",
      },
      customer_email: booking.email,
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe error: ${error.message}`);
    }
    throw new Error("Failed to create checkout session");
  }
}

export async function retrieveCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe error: ${error.message}`);
    }
    throw new Error("Failed to retrieve checkout session");
  }
}
