import { ObjectId } from "mongodb";
import { getDb } from "~/utils/db.server";
import type { BookingFormData } from "~/hooks/book.hooks";
import { localDateToUTCMidnight } from "~/utils/date";
import { Booking } from "~/types/booking";

export interface BookingDocument extends Omit<BookingFormData, 'bookingDate' | 'emailConfirm'> {
  _id?: ObjectId;
  date: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  paymentIntentId: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  totalAmount: number;
  phone: string; // Add phone field to BookingDocument
}

export async function createBooking(bookingData: Omit<Booking, '_id'>, paymentId: string): Promise<Booking> {
  const db = await getDb();
  
  const bookingDocument: Omit<BookingDocument, '_id'> = {
    fullName: bookingData.fullName,
    email: bookingData.email,
    phone: bookingData.phoneNumber || '', // Use phoneNumber from Booking or empty string
    date: bookingData.bookingDate,
    partySize: bookingData.partySize,
    status: 'confirmed',
    createdAt: new Date(),
    updatedAt: new Date(),
    paymentIntentId: paymentId,
    paymentStatus: 'paid',
    totalAmount: bookingData.amount,
  };

  const result = await db.collection('bookings').insertOne(bookingDocument);
  
  // Convert back to Booking type
  return {
    _id: result.insertedId.toString(),
    fullName: bookingDocument.fullName,
    email: bookingDocument.email,
    bookingDate: bookingDocument.date,
    partySize: bookingDocument.partySize,
    amount: bookingDocument.totalAmount,
    paymentId: bookingDocument.paymentIntentId,
    status: bookingDocument.status,
    paid: bookingDocument.paymentStatus === 'paid',
    phoneNumber: bookingDocument.phone, // Map phone back to phoneNumber
  };
}

export async function getBookingByPaymentIntent(paymentIntentId: string) {
  const db = await getDb();
  const booking = await db.collection('bookings').findOne({ paymentIntentId });
  
  if (!booking) return null;
  
  // Convert BookingDocument to Booking
  return {
    _id: booking._id.toString(),
    fullName: booking.fullName,
    email: booking.email,
    bookingDate: booking.date,
    partySize: booking.partySize,
    amount: booking.totalAmount,
    paymentId: booking.paymentIntentId,
    status: booking.status,
    paid: booking.paymentStatus === 'paid',
    phoneNumber: booking.phone, // Map phone back to phoneNumber
  };
}
