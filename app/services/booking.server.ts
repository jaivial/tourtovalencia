import { ObjectId } from "mongodb";
import { getCollection } from "~/utils/db.server";
import type { BookingFormData } from "~/hooks/book.hooks";
import { localDateToUTCMidnight } from "~/utils/date";

export interface BookingDocument extends Omit<BookingFormData, 'bookingDate' | 'emailConfirm'> {
  _id?: ObjectId;
  date: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  paymentIntentId: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  totalAmount: number;
}

export async function createBooking(
  bookingData: BookingFormData,
  paymentIntentId: string
): Promise<BookingDocument> {
  const bookings = await getCollection("bookings");
  
  const totalAmount = bookingData.partySize * 120;
  const utcDate = localDateToUTCMidnight(bookingData.bookingDate!);

  // Omit bookingDate and emailConfirm from bookingData
  const { bookingDate, emailConfirm, ...bookingDataWithoutDate } = bookingData;

  const booking: Omit<BookingDocument, '_id'> = {
    ...bookingDataWithoutDate,
    date: utcDate,
    status: 'confirmed',
    createdAt: new Date(),
    updatedAt: new Date(),
    paymentIntentId,
    paymentStatus: 'paid',
    totalAmount,
  };

  const result = await bookings.insertOne(booking);
  
  if (!result.acknowledged) {
    throw new Error('Failed to create booking');
  }

  return {
    ...booking,
    _id: result.insertedId,
  };
}

export async function getBookingByPaymentIntent(paymentIntentId: string) {
  const bookings = await getCollection("bookings");
  return bookings.findOne({ paymentIntentId });
}
