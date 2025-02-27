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
        country: booking.country || "",
        countryCode: booking.countryCode || "",
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

  // Find the tour by slug to get the correct price
  let tourPrice = 0;
  let tourName = "";
  
  try {
    const toursCollection = await getToursCollection();
    const tour = await toursCollection.findOne({ slug: booking.tourSlug || "" });
    if (tour) {
      tourName = tour.tourName?.es || tour.tourName?.en || tour.content?.es?.title || tour.content?.en?.title || "";
      tourPrice = tour.tourPrice || tour.content?.es?.price || tour.content?.en?.price || 0;
    }
  } catch (error) {
    console.error("Error finding tour:", error);
  }

  // Fallback to default price if tour not found
  const price = tourPrice > 0 ? tourPrice : 35; // default to 35 EUR
  const totalAmount = booking.partySize * price;

  try {
    // Ensure the date is a string when sending to Stripe
    const date = new Date(booking.date).toISOString();

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: tourName || "Excursion",
            },
            unit_amount: price * 100, // Convert from EUR to cents
          },
          quantity: booking.partySize,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book`,
      customer_email: booking.email,
      metadata: {
        date,
        time: booking.time,
        customerName: booking.fullName,
        customerEmail: booking.email,
        phoneNumber: booking.phoneNumber || "",
        country: booking.country || "",
        countryCode: booking.countryCode || "",
        partySize: booking.partySize.toString(),
        tourSlug: booking.tourSlug || "",
        tourName: tourName || "",
        paymentMethod: "stripe", // Track payment method used
      },
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
    console.log("Retrieved Stripe session:", {
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_email,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });
    
    // Add payment method to metadata
    const enhancedMetadata = {
      ...session.metadata,
      paymentMethod: 'stripe'
    };
    
    return {
      ...session,
      metadata: enhancedMetadata
    };
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe error: ${error.message}`);
    }
    throw new Error("Failed to retrieve checkout session");
  }
}
