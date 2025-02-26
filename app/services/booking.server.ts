import { ObjectId } from "mongodb";
import { getDb } from "~/utils/db.server";
import type { BookingFormData } from "~/hooks/book.hooks";
import { localDateToUTCMidnight } from "~/utils/date";
import { Booking } from "~/types/booking";

export interface BookingDocument extends Omit<BookingFormData, "emailConfirm" | "date"> {
  _id?: ObjectId;
  date: Date;
  time?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  paymentIntentId: string;
  paymentStatus: "pending" | "paid" | "failed";
  totalAmount: number;
  phoneNumber: string;
  tourSlug: string;
  tourName?: string;
  tourType?: string;
}

export async function createBooking(bookingData: Omit<Booking, "_id">, paymentId: string): Promise<Booking> {
  const db = await getDb();

  // Convert amount from cents to euros if needed
  let totalAmount = bookingData.amount;
  if (totalAmount > 100) {
    totalAmount = totalAmount / 100;
  }

  const bookingDocument: Omit<BookingDocument, "_id"> = {
    fullName: bookingData.fullName,
    email: bookingData.email,
    phoneNumber: bookingData.phoneNumber || "",
    date: new Date(bookingData.date),
    time: bookingData.time || "",
    partySize: bookingData.partySize,
    status: "confirmed",
    createdAt: new Date(),
    updatedAt: new Date(),
    paymentIntentId: paymentId,
    paymentStatus: "paid",
    totalAmount: totalAmount,
    tourSlug: bookingData.tourSlug || "",
    tourName: bookingData.tourName,
    tourType: bookingData.tourName,
  };

  const result = await db.collection("bookings").insertOne(bookingDocument);

  return {
    _id: result.insertedId.toString(),
    fullName: bookingDocument.fullName,
    email: bookingDocument.email,
    date: bookingDocument.date.toISOString(),
    time: bookingDocument.time,
    partySize: bookingDocument.partySize,
    amount: bookingDocument.totalAmount,
    paymentId: bookingDocument.paymentIntentId,
    status: bookingDocument.status,
    paid: bookingDocument.paymentStatus === "paid",
    phoneNumber: bookingDocument.phoneNumber,
  };
}

export async function getBookingByPaymentIntent(paymentIntentId: string): Promise<Booking | null> {
  const db = await getDb();
  const booking = await db.collection("bookings").findOne({ paymentIntentId });

  if (!booking) return null;

  return {
    _id: booking._id.toString(),
    fullName: booking.fullName,
    email: booking.email,
    date: booking.date.toISOString(),
    time: booking.time,
    partySize: booking.partySize,
    amount: booking.totalAmount,
    paymentId: booking.paymentIntentId,
    status: booking.status,
    phoneNumber: booking.phoneNumber,
    paid: booking.paymentStatus === "paid",
  };
}
