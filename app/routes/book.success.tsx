import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { BookingSuccessUI } from "~/components/ui/BookingSuccessUI";
import type { Booking } from "~/types/booking";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/components/emails/BookingConfirmationEmail";
import { BookingAdminEmail } from "~/components/emails/BookingAdminEmail";
import { getCollection } from "~/utils/db.server";
import { getPaymentSessionPublicData, type PaymentSessionPublicData } from "~/services/paymentSession.server";

const EMAIL_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`${label} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

interface PersistedBookingRecord {
  _id?: unknown;
  fullName: string;
  email: string;
  date: Date;
  partySize: number;
  status: "confirmed";
  createdAt: Date;
  updatedAt: Date;
  paymentIntentId: string;
  paymentStatus: "paid";
  totalAmount: number;
  amount: number;
  phoneNumber: string;
  country?: string;
  countryCode?: string;
  tourSlug?: string;
  tourName?: string;
  paymentMethod: "paypal";
  language: string;
  customerEmailSentAt?: Date;
  adminEmailSentAt?: Date;
}

function toBookingModel(record: PersistedBookingRecord): Booking {
  return {
    _id: String(record._id ?? record.paymentIntentId),
    fullName: record.fullName,
    email: record.email,
    date: record.date,
    partySize: record.partySize,
    amount: record.amount ?? record.totalAmount,
    totalAmount: record.totalAmount,
    paymentIntentId: record.paymentIntentId,
    phoneNumber: record.phoneNumber,
    country: record.country,
    countryCode: record.countryCode,
    status: record.status,
    paymentStatus: record.paymentStatus,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    tourSlug: record.tourSlug,
    tourName: record.tourName,
    paymentMethod: record.paymentMethod,
    language: record.language,
  };
}

interface LoaderData {
  sessionId: string | null;
  session: PaymentSessionPublicData | null;
  error?: string;
}

// Server-authoritative success page: only reads payment session status by sessionId.
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return json<LoaderData>(
      {
        sessionId: null,
        session: null,
        error: "Missing payment session id.",
      },
      { status: 400 }
    );
  }

  const session = await getPaymentSessionPublicData(sessionId);

  if (!session) {
    return json<LoaderData>(
      {
        sessionId,
        session: null,
        error: "Payment session not found.",
      },
      { status: 404 }
    );
  }

  return json<LoaderData>({
    sessionId,
    session,
  });
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const rawBooking = formData.get("booking");

  if (typeof rawBooking !== "string") {
    return json({ success: false, error: "Missing booking payload" }, { status: 400 });
  }

  let bookingData: Booking;
  try {
    bookingData = JSON.parse(rawBooking) as Booking;
  } catch {
    return json({ success: false, error: "Invalid booking payload" }, { status: 400 });
  }

  if (!bookingData.paymentIntentId) {
    return json({ success: false, error: "Missing payment intent id" }, { status: 400 });
  }

  try {
    // Log the amount for debugging
    console.log("Original amount from PayPal:", bookingData.amount);
    console.log("Party size:", bookingData.partySize);
    console.log("Tour slug:", bookingData.tourSlug);
    console.log("Payment method:", bookingData.paymentMethod || "PayPal");
    console.log("Language:", bookingData.language || "es");
    
    // Save to MongoDB (idempotent by paymentIntentId)
    const bookingsCollection = await getCollection<PersistedBookingRecord>("bookings");
    const now = new Date();

    // Ensure we have the tour name
    let tourName = bookingData.tourName || "";
    let tourPrice = 0;
    
    // If we have a tourSlug, try to get the tour details from the tours collection
    if (bookingData.tourSlug) {
      try {
        const toursCollection = await getCollection("tours");
        const tour = await toursCollection.findOne({ slug: bookingData.tourSlug });
        if (tour) {
          // Fix the type conversion by first casting to unknown
          const typedTour = tour as unknown as { tourName: { en: string; es: string }, tourPrice: number };
          
          // Use the appropriate language version of the tour name if available
          const language = bookingData.language || "es";
          tourName = language === "en" && typedTour.tourName.en ? 
                    typedTour.tourName.en : 
                    typedTour.tourName.es || typedTour.tourName.en || "";
                    
          tourPrice = typedTour.tourPrice || 0;
          console.log("Tour price from database:", tourPrice);
        }
      } catch (error) {
        console.error("Error fetching tour name:", error);
        // Continue with empty tour name if there's an error
      }
    }

    // Calculate the final amount based on party size and tour price
    const finalAmount = tourPrice > 0 ? 
      bookingData.partySize * tourPrice : 
      bookingData.amount;
    
    console.log("Final calculated amount:", finalAmount);
    
    // Create the booking record
    const bookingRecord: Omit<PersistedBookingRecord, "_id"> = {
      fullName: bookingData.fullName,
      email: bookingData.email,
      date: new Date(bookingData.date),
      partySize: bookingData.partySize,
      status: "confirmed" as const,
      createdAt: now,
      updatedAt: now,
      paymentIntentId: bookingData.paymentIntentId,
      paymentStatus: "paid" as const,
      totalAmount: finalAmount,
      amount: finalAmount,
      phoneNumber: bookingData.phoneNumber,
      country: bookingData.country,
      countryCode: bookingData.countryCode,
      tourSlug: bookingData.tourSlug,
      tourName: tourName,
      paymentMethod: "paypal" as const,
      language: bookingData.language || "es",
    };

    const existingBooking = await bookingsCollection.findOne({
      paymentIntentId: bookingData.paymentIntentId,
    });

    let persistedBooking: PersistedBookingRecord;

    if (existingBooking) {
      persistedBooking = existingBooking;
      console.log(`Booking already exists for payment ${bookingData.paymentIntentId}, skipping duplicate insert`);
    } else {
      const insertResult = await bookingsCollection.insertOne(bookingRecord);
      persistedBooking = { ...bookingRecord, _id: insertResult.insertedId };
    }

    // Build the complete booking object for emails/UI
    const completeBooking = toBookingModel(persistedBooking);

    // Send confirmation email to customer
    const shouldSendCustomerEmail = !persistedBooking.customerEmailSentAt;
    const shouldSendAdminEmail = !persistedBooking.adminEmailSentAt;
    let customerEmailSent = !shouldSendCustomerEmail;
    let adminEmailSent = !shouldSendAdminEmail;

    const emailTasks: Promise<void>[] = [];

    if (shouldSendCustomerEmail) {
      const emailSubject = bookingData.language === "en"
        ? "Booking Confirmation - Tour to Valencia"
        : "Confirmación de Reserva - Tour to Valencia";

      emailTasks.push(
        withTimeout(
          sendEmail({
            to: bookingData.email,
            subject: emailSubject,
            component: BookingConfirmationEmail({
              booking: {
                ...completeBooking,
                paymentMethod: "paypal",
                language: bookingData.language || "es",
              },
            }),
          }),
          EMAIL_TIMEOUT_MS,
          "Customer email"
        )
          .then(async () => {
            customerEmailSent = true;
            await bookingsCollection.updateOne(
              { paymentIntentId: bookingData.paymentIntentId },
              { $set: { customerEmailSentAt: new Date(), updatedAt: new Date() } }
            );
            console.log(`✅ Customer confirmation email sent to ${bookingData.email}`);
          })
          .catch((emailError) => {
            console.error("Error sending customer confirmation email:", emailError);
          })
      );
    }

    if (shouldSendAdminEmail) {
      const adminEmail = process.env.ADMIN_EMAIL || "tourtovalencia@gmail.com";
      console.log(`Attempting to send admin notification to: ${adminEmail}`);

      emailTasks.push(
        withTimeout(
          sendEmail({
            to: adminEmail,
            subject: `Nueva Reserva: ${bookingData.fullName} - ${tourName || "Tour to Valencia"}`,
            component: <BookingAdminEmail booking={completeBooking} />,
          }),
          EMAIL_TIMEOUT_MS,
          "Admin email"
        )
          .then(async () => {
            adminEmailSent = true;
            await bookingsCollection.updateOne(
              { paymentIntentId: bookingData.paymentIntentId },
              { $set: { adminEmailSentAt: new Date(), updatedAt: new Date() } }
            );
            console.log(`✅ Admin notification email sent to ${adminEmail}`);
          })
          .catch((adminEmailError) => {
            console.error("Error sending admin notification email:", adminEmailError);
          })
      );
    }

    // Never block booking confirmation due to email transport issues.
    // Run email attempts in the background and return success immediately.
    if (emailTasks.length > 0) {
      void Promise.all(emailTasks).catch((backgroundEmailError) => {
        console.error("Background email processing failed:", backgroundEmailError);
      });
    }

    return json({
      success: true,
      booking: completeBooking,
      emails: {
        customer: customerEmailSent,
        admin: adminEmailSent,
      },
    });
  } catch (error) {
    console.error("Error processing booking:", error);
    return json({ success: false, error: "Failed to process booking" }, { status: 500 });
  }
}

export default function BookingSuccess() {
  const { sessionId, session, error } = useLoaderData<LoaderData>();
  const [sessionData, setSessionData] = useState<PaymentSessionPublicData | null>(session);
  const [pollError, setPollError] = useState<string | null>(null);

  const shouldPoll = Boolean(
    sessionId &&
      sessionData &&
      sessionData.bookingStatus !== "confirmed" &&
      sessionData.status !== "failed"
  );

  useEffect(() => {
    if (!shouldPoll || !sessionId) {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/session/${encodeURIComponent(sessionId)}`);
        const payload = (await response.json()) as {
          success?: boolean;
          error?: string;
          session?: PaymentSessionPublicData;
        };

        if (!response.ok || !payload.success || !payload.session) {
          throw new Error(payload.error || "Unable to refresh payment status");
        }

        if (!cancelled) {
          setSessionData(payload.session);
          setPollError(null);
        }
      } catch (pollingError) {
        if (!cancelled) {
          setPollError(pollingError instanceof Error ? pollingError.message : "Unable to refresh payment status");
        }
      }
    };

    void poll();
    const interval = setInterval(() => {
      void poll();
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId, shouldPoll]);

  if (error || !sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Booking confirmation unavailable</h1>
          <p className="text-muted-foreground">{error || "Missing payment session id."}</p>
          <a href="/book" className="text-primary underline">
            Back to booking
          </a>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  if (sessionData.status === "failed" || sessionData.bookingStatus === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Payment failed</h1>
          <p className="text-muted-foreground">
            {sessionData.errorMessage || "The payment could not be confirmed. Please try again."}
          </p>
          <a href="/book" className="text-primary underline">
            Return to booking
          </a>
        </div>
      </div>
    );
  }

  if (sessionData.bookingStatus !== "confirmed" || !sessionData.booking) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="space-y-4">
          <div className="mx-auto animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
          <h1 className="text-2xl font-semibold">Finalizing your booking</h1>
          <p className="text-muted-foreground">
            Your payment is confirmed. We are finishing your booking details...
          </p>
          {pollError && <p className="text-sm text-muted-foreground">{pollError}</p>}
        </div>
      </div>
    );
  }

  const emailStatus = sessionData.customerEmailSent ? "sent" : "sending";
  return <BookingSuccessUI booking={sessionData.booking} emailStatus={emailStatus} />;
}
