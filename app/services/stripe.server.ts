import Stripe from "stripe";
import { BookingFormData } from "~/hooks/book.hooks";
import { getToursCollection } from "~/utils/db.server";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY must be defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

export async function createPaymentIntent(booking: BookingFormData) {
  if (!booking.date) {
    throw new Error("Booking date is required");
  }

  const totalAmount = booking.partySize * 0.5 * 100; // 0.5 EUR converted to cents

  try {
    // Ensure the date is a string when sending to Stripe
    const date = new Date(booking.date).toISOString();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "eur",
      metadata: {
        date,
        time: booking.time,
        customerName: booking.fullName,
        customerEmail: booking.email,
        phoneNumber: booking.phoneNumber || "",
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

export async function createCheckoutSession(booking: BookingFormData, baseUrl: string) {
  if (!booking.date) {
    throw new Error("Booking date is required");
  }

  if (!baseUrl || !baseUrl.startsWith('http')) {
    throw new Error(`Invalid base URL provided: ${baseUrl}`);
  }

  // Get tour information from the tours collection if tourSlug is provided
  let tourName = "Excursión a Cuevas de San Jose";
  let tourPrice = 0.5; // Default price in EUR
  
  if (booking.tourSlug) {
    try {
      const toursCollection = await getToursCollection();
      const tour = await toursCollection.findOne({ slug: booking.tourSlug });
      
      if (tour) {
        tourName = tour.tourName.en;
        tourPrice = tour.tourPrice || tourPrice;
      }
    } catch (error) {
      console.error("Error fetching tour information:", error);
      // Continue with default values if there's an error
    }
  }

  const totalAmount = booking.partySize * tourPrice * 100; // Convert to cents

  try {
    // Ensure the date is a string when sending to Stripe
    const date = new Date(booking.date).toISOString();

    // Clean the base URL (remove trailing slashes)
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    console.log('Creating Stripe session with base URL:', cleanBaseUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: tourName,
              description: `Reserva para ${booking.partySize} ${booking.partySize === 1 ? "persona" : "personas"} el ${new Date(date).toLocaleDateString("es-ES")}`,
            },
            unit_amount: Math.round(totalAmount), // Ensure it's an integer
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${cleanBaseUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cleanBaseUrl}/book?error=payment-cancelled`,
      metadata: {
        date,
        time: booking.time,
        customerName: booking.fullName,
        customerEmail: booking.email,
        phoneNumber: booking.phoneNumber || "",
        partySize: booking.partySize.toString(),
        tourSlug: booking.tourSlug || "",
        tourName: tourName,
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
