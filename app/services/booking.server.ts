import { ObjectId } from "mongodb";
import { getDb } from "~/utils/db.server";
import type { BookingFormData } from "~/hooks/book.hooks";
import { localDateToUTCMidnight } from "~/utils/date";
import { Booking } from "~/types/booking";
import { refundPayPalPayment } from "~/utils/paypal.server";

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
  language?: string;
  country: string;
  countryCode: string;
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
    language: bookingData.language || "es",
    country: bookingData.country || "",
    countryCode: bookingData.countryCode || ""
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
    language: bookingDocument.language,
    country: bookingDocument.country,
    countryCode: bookingDocument.countryCode
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

interface CancellationResult {
  success: boolean;
  message: string;
  refundResult?: {
    success: boolean;
    refundId?: string;
    error?: string;
  };
}

/**
 * Cancel a booking and optionally process a refund
 */
export async function cancelBooking(
  bookingId: string,
  shouldRefund: boolean,
  cancellationReason: string
): Promise<CancellationResult> {
  try {
    const db = await getDb();
    
    // Get the booking to cancel
    const booking = await db.collection("bookings").findOne({ 
      _id: new ObjectId(bookingId) 
    });
    
    if (!booking) {
      return { 
        success: false, 
        message: "Booking not found" 
      };
    }
    
    // Update booking status to cancelled
    const updateResult = await db.collection("bookings").updateOne(
      { _id: new ObjectId(bookingId) },
      { 
        $set: { 
          status: "cancelled",
          updatedAt: new Date(),
          cancellationReason,
          refundIssued: shouldRefund,
          cancelledAt: new Date()
        } 
      }
    );
    
    if (updateResult.modifiedCount === 0) {
      return { 
        success: false, 
        message: "Failed to cancel booking" 
      };
    }
    
    // Process refund if requested
    let refundResult;
    if (shouldRefund) {
      // Mark refund as pending initially
      await db.collection("bookings").updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: { refundStatus: "pending" } }
      );
      
      // Process refund based on payment method
      if (booking.paymentMethod === "paypal" && booking.transactionId) {
        // Get amount in the correct format (ensure it's a number)
        const amount = typeof booking.amount === 'number' 
          ? booking.amount 
          : typeof booking.totalAmount === 'number'
            ? booking.totalAmount
            : 0;
            
        // Process PayPal refund
        refundResult = await refundPayPalPayment(
          booking.transactionId,
          amount,
          cancellationReason
        );
        
        // Update booking with refund result
        await db.collection("bookings").updateOne(
          { _id: new ObjectId(bookingId) },
          { 
            $set: { 
              refundStatus: refundResult.success ? "completed" : "failed",
              refundId: refundResult.refundId,
              refundError: refundResult.error,
              refundedAt: refundResult.success ? new Date() : undefined
            } 
          }
        );
      } else if (booking.paymentMethod === "stripe" && booking.transactionId) {
        // TODO: Implement Stripe refund logic
        refundResult = {
          success: false,
          error: "Stripe refunds not yet implemented"
        };
      } else {
        refundResult = {
          success: false,
          error: `Cannot process refund: Invalid payment method or missing transaction ID`
        };
      }
    }
    
    // Send cancellation email to customer
    try {
      // TODO: Implement email notification for cancellation
      console.log(`Cancellation notification would be sent to ${booking.email}`);
    } catch (emailError) {
      console.error("Error sending cancellation email:", emailError);
      // Continue execution even if email fails
    }
    
    return {
      success: true,
      message: `Booking cancelled successfully${shouldRefund ? " with refund" : ""}`,
      refundResult
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error cancelling booking"
    };
  }
}
