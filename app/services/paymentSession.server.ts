import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import type { Booking } from "~/types/booking";
import { getCollection } from "~/utils/db.server";
import { sendEmail } from "~/utils/email.server";
import { BookingAdminEmail } from "~/components/emails/BookingAdminEmail";
import { BookingConfirmationEmail } from "~/components/emails/BookingConfirmationEmail";

const PAYMENT_SESSION_COLLECTION = "paymentSessions";
const BOOKINGS_COLLECTION = "bookings";
const TOURS_COLLECTION = "tours";
const EMAIL_TIMEOUT_MS = 8_000;

export type PaymentSessionStatus = "created" | "approved" | "captured" | "completed" | "failed";
export type PaymentSessionBookingStatus = "pending" | "confirmed" | "failed";

export interface PaymentBookingDraft {
  fullName: string;
  email: string;
  date: string;
  time?: string;
  partySize: number;
  phoneNumber: string;
  tourSlug: string;
  tourName?: string;
  language?: string;
  country?: string;
  countryCode?: string;
}

export interface PaymentSessionRecord {
  _id?: ObjectId;
  sessionId: string;
  provider: "paypal";
  status: PaymentSessionStatus;
  bookingStatus: PaymentSessionBookingStatus;
  bookingDraft: PaymentBookingDraft;
  amount: number;
  currency: "EUR";
  orderId?: string;
  captureId?: string;
  errorCode?: string;
  errorMessage?: string;
  bookingId?: string;
  booking?: Booking;
  customerEmailSentAt?: Date;
  adminEmailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  capturedAt?: Date;
  confirmedAt?: Date;
}

interface PersistedBookingRecord {
  _id?: ObjectId;
  fullName: string;
  email: string;
  date: Date;
  time?: string;
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
  transactionId?: string;
  customerEmailSentAt?: Date;
  adminEmailSentAt?: Date;
}

interface TourRecord {
  slug?: string;
  name?: string;
  tourName?: { en?: string; es?: string };
  tourPrice?: number;
  minPeople?: number;
  maxPeople?: number;
  content?: {
    en?: { title?: string; price?: number; minPeople?: number; maxPeople?: number };
    es?: { title?: string; price?: number; minPeople?: number; maxPeople?: number };
  };
}

export interface PaymentSessionPublicData {
  sessionId: string;
  status: PaymentSessionStatus;
  bookingStatus: PaymentSessionBookingStatus;
  amount: number;
  currency: string;
  errorCode?: string;
  errorMessage?: string;
  booking?: Booking;
  customerEmailSent: boolean;
  adminEmailSent: boolean;
  createdAt: string;
  updatedAt: string;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function toBookingModel(record: PersistedBookingRecord): Booking {
  return {
    _id: String(record._id ?? record.paymentIntentId),
    fullName: record.fullName,
    email: record.email,
    date: record.date,
    partySize: record.partySize,
    amount: record.amount,
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
    transactionId: record.transactionId,
    language: record.language,
  };
}

function sanitizeLanguage(language?: string): "en" | "es" {
  return language === "en" ? "en" : "es";
}

async function resolveTourMetadata(bookingDraft: PaymentBookingDraft): Promise<{ tourName: string; tourPrice: number; minPeople: number; maxPeople: number }> {
  const language = sanitizeLanguage(bookingDraft.language);
  const toursCollection = await getCollection<TourRecord>(TOURS_COLLECTION);

  const tour = bookingDraft.tourSlug
    ? await toursCollection.findOne({ slug: bookingDraft.tourSlug })
    : null;

  if (!tour) {
    return {
      tourName: bookingDraft.tourName || bookingDraft.tourSlug || "Tour to Valencia",
      tourPrice: 0,
      minPeople: 1,
      maxPeople: 10,
    };
  }

  const localizedTitle = language === "en"
    ? tour.content?.en?.title || tour.tourName?.en
    : tour.content?.es?.title || tour.tourName?.es;

  const fallbackTitle = tour.content?.en?.title || tour.tourName?.en || tour.name || bookingDraft.tourSlug || "Tour to Valencia";
  const tourName = localizedTitle || fallbackTitle;
  const tourPrice = Number(tour.content?.en?.price ?? tour.content?.es?.price ?? tour.tourPrice ?? 0);

  // Get minPeople/maxPeople from tour or content, with defaults
  const tourMinPeople = typeof tour.minPeople === "number" ? tour.minPeople : 1;
  const tourMaxPeople = typeof tour.maxPeople === "number" ? tour.maxPeople : 10;
  const contentMinPeople = tour.content?.es?.minPeople ?? tour.content?.en?.minPeople;
  const contentMaxPeople = tour.content?.es?.maxPeople ?? tour.content?.en?.maxPeople;

  const minPeople = typeof contentMinPeople === "number" ? contentMinPeople : tourMinPeople;
  const maxPeople = typeof contentMaxPeople === "number" ? contentMaxPeople : tourMaxPeople;

  return { tourName, tourPrice, minPeople, maxPeople };
}

export async function resolvePaymentDraftPricing(bookingDraft: PaymentBookingDraft): Promise<{ tourName: string; amount: number }> {
  const { tourName, tourPrice } = await resolveTourMetadata(bookingDraft);

  if (tourPrice <= 0) {
    throw new Error("Could not determine a valid tour price for payment");
  }

  const amount = normalizeAmount(bookingDraft.partySize * tourPrice);
  return { tourName, amount };
}

export async function validateBookingRange(bookingDraft: PaymentBookingDraft): Promise<{ minPeople: number; maxPeople: number }> {
  const { minPeople, maxPeople } = await resolveTourMetadata(bookingDraft);

  if (bookingDraft.partySize < minPeople) {
    throw new Error(`Party size must be at least ${minPeople} people`);
  }

  if (bookingDraft.partySize > maxPeople) {
    throw new Error(`Party size cannot exceed ${maxPeople} people`);
  }

  return { minPeople, maxPeople };
}

function parseBookingDate(dateValue: string): Date {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid booking date");
  }
  return parsed;
}

function normalizeAmount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid payment amount");
  }
  return Number(value.toFixed(2));
}

function createSessionExpiryDate(): Date {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  return expiresAt;
}

async function getPaymentSessionCollection() {
  return getCollection<PaymentSessionRecord>(PAYMENT_SESSION_COLLECTION);
}

export async function createPayPalPaymentSession(input: {
  bookingDraft: PaymentBookingDraft;
  amount: number;
  currency?: "EUR";
}): Promise<PaymentSessionRecord> {
  const sessions = await getPaymentSessionCollection();
  const now = new Date();
  const sessionId = randomUUID();

  const session: PaymentSessionRecord = {
    sessionId,
    provider: "paypal",
    status: "created",
    bookingStatus: "pending",
    bookingDraft: input.bookingDraft,
    amount: normalizeAmount(input.amount),
    currency: input.currency || "EUR",
    createdAt: now,
    updatedAt: now,
    expiresAt: createSessionExpiryDate(),
  };

  await sessions.insertOne(session);
  return session;
}

export async function getPaymentSessionById(sessionId: string): Promise<PaymentSessionRecord | null> {
  const sessions = await getPaymentSessionCollection();
  return sessions.findOne({ sessionId });
}

export async function getPaymentSessionByOrderId(orderId: string): Promise<PaymentSessionRecord | null> {
  const sessions = await getPaymentSessionCollection();
  return sessions.findOne({ orderId });
}

export async function bindPayPalOrderToSession(sessionId: string, orderId: string): Promise<void> {
  const sessions = await getPaymentSessionCollection();
  await sessions.updateOne(
    { sessionId },
    {
      $set: {
        orderId,
        updatedAt: new Date(),
      },
    }
  );
}

export async function markPayPalSessionAsApproved(sessionId: string): Promise<void> {
  const sessions = await getPaymentSessionCollection();
  await sessions.updateOne(
    { sessionId },
    {
      $set: {
        status: "approved",
        updatedAt: new Date(),
      },
    }
  );
}

export async function markPayPalSessionAsCaptured(input: {
  sessionId: string;
  orderId: string;
  captureId?: string;
}): Promise<void> {
  const sessions = await getPaymentSessionCollection();
  await sessions.updateOne(
    { sessionId: input.sessionId },
    {
      $set: {
        status: "captured",
        orderId: input.orderId,
        captureId: input.captureId,
        capturedAt: new Date(),
        errorCode: undefined,
        errorMessage: undefined,
        updatedAt: new Date(),
      },
    }
  );
}

export async function markPayPalSessionAsFailed(input: {
  sessionId: string;
  errorCode?: string;
  errorMessage?: string;
}): Promise<void> {
  const sessions = await getPaymentSessionCollection();
  await sessions.updateOne(
    { sessionId: input.sessionId },
    {
      $set: {
        status: "failed",
        bookingStatus: "failed",
        errorCode: input.errorCode,
        errorMessage: input.errorMessage,
        updatedAt: new Date(),
      },
    }
  );
}

async function queueBookingEmails(
  bookingsCollection: Awaited<ReturnType<typeof getCollection<PersistedBookingRecord>>>,
  bookingRecord: PersistedBookingRecord,
  completeBooking: Booking,
  sessionId: string
) {
  const shouldSendCustomerEmail = !bookingRecord.customerEmailSentAt;
  const shouldSendAdminEmail = !bookingRecord.adminEmailSentAt;

  if (!shouldSendCustomerEmail && !shouldSendAdminEmail) {
    return {
      customerEmailSentAt: bookingRecord.customerEmailSentAt,
      adminEmailSentAt: bookingRecord.adminEmailSentAt,
    };
  }

  const emailTasks: Promise<void>[] = [];

  if (shouldSendCustomerEmail) {
    const emailSubject = completeBooking.language === "en"
      ? "Booking Confirmation - Tour to Valencia"
      : "Confirmacion de Reserva - Tour to Valencia";

    emailTasks.push(
      withTimeout(
        sendEmail({
          to: completeBooking.email,
          subject: emailSubject,
          component: BookingConfirmationEmail({
            booking: {
              ...completeBooking,
              paymentMethod: "paypal",
              language: completeBooking.language || "es",
            },
          }),
        }),
        EMAIL_TIMEOUT_MS,
        "Customer email"
      )
        .then(async () => {
          const now = new Date();
          await bookingsCollection.updateOne(
            { paymentIntentId: completeBooking.paymentIntentId },
            { $set: { customerEmailSentAt: now, updatedAt: now } }
          );
          await getPaymentSessionCollection().then((sessions) => sessions.updateOne(
            { sessionId },
            {
              $set: {
                customerEmailSentAt: now,
                updatedAt: now,
              },
            }
          ));
        })
        .catch((error) => {
          console.error("Error sending customer booking email:", error);
        })
    );
  }

  if (shouldSendAdminEmail) {
    const adminEmail = process.env.ADMIN_EMAIL || "tourtovalencia@gmail.com";

    emailTasks.push(
      withTimeout(
        sendEmail({
          to: adminEmail,
          subject: `Nueva Reserva: ${completeBooking.fullName} - ${completeBooking.tourName || "Tour to Valencia"}`,
          component: BookingAdminEmail({ booking: completeBooking }),
        }),
        EMAIL_TIMEOUT_MS,
        "Admin email"
      )
        .then(async () => {
          const now = new Date();
          await bookingsCollection.updateOne(
            { paymentIntentId: completeBooking.paymentIntentId },
            { $set: { adminEmailSentAt: now, updatedAt: now } }
          );
          await getPaymentSessionCollection().then((sessions) => sessions.updateOne(
            { sessionId },
            {
              $set: {
                adminEmailSentAt: now,
                updatedAt: now,
              },
            }
          ));
        })
        .catch((error) => {
          console.error("Error sending admin booking email:", error);
        })
    );
  }

  if (emailTasks.length > 0) {
    void Promise.all(emailTasks).catch((error) => {
      console.error("Background booking email processing failed:", error);
    });
  }

  return {
    customerEmailSentAt: bookingRecord.customerEmailSentAt,
    adminEmailSentAt: bookingRecord.adminEmailSentAt,
  };
}

export async function ensureConfirmedBookingForSession(sessionId: string): Promise<Booking> {
  const session = await getPaymentSessionById(sessionId);
  if (!session) {
    throw new Error("Payment session not found");
  }

  if (!session.orderId) {
    throw new Error("Payment session has no PayPal order id");
  }

  if (session.bookingStatus === "confirmed" && session.booking) {
    return session.booking;
  }

  if (session.status !== "captured" && session.status !== "completed") {
    throw new Error(`Payment session is not captured (status: ${session.status})`);
  }

  const bookingsCollection = await getCollection<PersistedBookingRecord>(BOOKINGS_COLLECTION);
  const now = new Date();

  const existingBooking = await bookingsCollection.findOne({ paymentIntentId: session.orderId });
  let persistedBooking: PersistedBookingRecord;

  if (existingBooking) {
    persistedBooking = existingBooking;
  } else {
    const { tourName, tourPrice } = await resolveTourMetadata(session.bookingDraft);
    const computedAmount = tourPrice > 0
      ? session.bookingDraft.partySize * tourPrice
      : session.amount;

    const normalizedAmount = normalizeAmount(computedAmount);

    const newBooking: Omit<PersistedBookingRecord, "_id"> = {
      fullName: session.bookingDraft.fullName,
      email: session.bookingDraft.email,
      date: parseBookingDate(session.bookingDraft.date),
      time: session.bookingDraft.time || "",
      partySize: session.bookingDraft.partySize,
      status: "confirmed",
      createdAt: now,
      updatedAt: now,
      paymentIntentId: session.orderId,
      paymentStatus: "paid",
      totalAmount: normalizedAmount,
      amount: normalizedAmount,
      phoneNumber: session.bookingDraft.phoneNumber,
      country: session.bookingDraft.country,
      countryCode: session.bookingDraft.countryCode,
      tourSlug: session.bookingDraft.tourSlug,
      tourName,
      paymentMethod: "paypal",
      language: sanitizeLanguage(session.bookingDraft.language),
      transactionId: session.captureId,
    };

    const insertResult = await bookingsCollection.insertOne(newBooking);
    persistedBooking = { ...newBooking, _id: insertResult.insertedId };
  }

  const booking = toBookingModel(persistedBooking);

  await getPaymentSessionCollection().then((sessions) => sessions.updateOne(
    { sessionId },
    {
      $set: {
        status: "completed",
        bookingStatus: "confirmed",
        bookingId: String(persistedBooking._id ?? ""),
        booking,
        confirmedAt: now,
        updatedAt: now,
      },
    }
  ));

  await queueBookingEmails(bookingsCollection, persistedBooking, booking, sessionId);

  return booking;
}

export async function getPaymentSessionPublicData(sessionId: string): Promise<PaymentSessionPublicData | null> {
  const session = await getPaymentSessionById(sessionId);
  if (!session) return null;

  let bookingRecord: PersistedBookingRecord | null = null;
  if (session.orderId) {
    bookingRecord = await getCollection<PersistedBookingRecord>(BOOKINGS_COLLECTION).then((bookings) =>
      bookings.findOne({ paymentIntentId: session.orderId })
    );
  }

  const booking = session.booking ?? (bookingRecord ? toBookingModel(bookingRecord) : undefined);
  const customerEmailSent = Boolean(session.customerEmailSentAt || bookingRecord?.customerEmailSentAt);
  const adminEmailSent = Boolean(session.adminEmailSentAt || bookingRecord?.adminEmailSentAt);

  return {
    sessionId: session.sessionId,
    status: session.status,
    bookingStatus: session.bookingStatus,
    amount: session.amount,
    currency: session.currency,
    errorCode: session.errorCode,
    errorMessage: session.errorMessage,
    booking,
    customerEmailSent,
    adminEmailSent,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

function extractCaptureIdFromResource(resource: unknown): string | undefined {
  if (!resource || typeof resource !== "object") return undefined;

  const captureId = (resource as { id?: unknown }).id;
  if (typeof captureId === "string") return captureId;

  const purchaseUnits = (resource as { purchase_units?: Array<{ payments?: { captures?: Array<{ id?: string }> } }> }).purchase_units;
  return purchaseUnits?.[0]?.payments?.captures?.[0]?.id;
}

function extractOrderIdFromResource(resource: unknown): string | undefined {
  if (!resource || typeof resource !== "object") return undefined;

  const orderId = (resource as { id?: unknown }).id;
  if (typeof orderId === "string") return orderId;

  const supplementary = (resource as { supplementary_data?: { related_ids?: { order_id?: unknown } } }).supplementary_data;
  const relatedOrderId = supplementary?.related_ids?.order_id;
  return typeof relatedOrderId === "string" ? relatedOrderId : undefined;
}

function getWebhookErrorMessage(resource: unknown): string | undefined {
  if (!resource || typeof resource !== "object") return undefined;

  const statusDetails = (resource as { status_details?: { reason?: unknown } }).status_details;
  if (typeof statusDetails?.reason === "string") return statusDetails.reason;

  const reasonCode = (resource as { reason_code?: unknown }).reason_code;
  if (typeof reasonCode === "string") return reasonCode;

  return undefined;
}

export async function handlePayPalWebhookEvent(eventBody: Record<string, unknown>): Promise<void> {
  const eventType = typeof eventBody.event_type === "string" ? eventBody.event_type : "";
  const resource = eventBody.resource as Record<string, unknown> | undefined;

  if (!resource) {
    return;
  }

  const orderId = extractOrderIdFromResource(resource);
  if (!orderId) {
    return;
  }

  const session = await getPaymentSessionByOrderId(orderId);
  if (!session) {
    return;
  }

  if (eventType === "CHECKOUT.ORDER.APPROVED") {
    await markPayPalSessionAsApproved(session.sessionId);
    return;
  }

  if (eventType === "CHECKOUT.ORDER.COMPLETED" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const captureId = extractCaptureIdFromResource(resource);
    await markPayPalSessionAsCaptured({
      sessionId: session.sessionId,
      orderId,
      captureId,
    });

    try {
      await ensureConfirmedBookingForSession(session.sessionId);
    } catch (error) {
      console.error("Failed to confirm booking from PayPal webhook:", error);
    }
    return;
  }

  if (
    eventType === "PAYMENT.CAPTURE.DENIED" ||
    eventType === "PAYMENT.CAPTURE.DECLINED" ||
    eventType === "CHECKOUT.PAYMENT-APPROVAL.REVERSED"
  ) {
    await markPayPalSessionAsFailed({
      sessionId: session.sessionId,
      errorCode: eventType,
      errorMessage: getWebhookErrorMessage(resource),
    });
  }
}
