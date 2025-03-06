import { ObjectId } from "mongodb";
import { getDb } from "~/utils/db.server";
import { Booking } from "~/types/booking";
import { refundPayPalPayment } from "~/utils/paypal.server";
import { v4 as uuidv4 } from "uuid";

// Define the booking document structure for MongoDB
export interface BookingDocument {
  _id?: ObjectId;
  bookingId: string;
  fullName: string;
  email: string;
  date: Date;
  time?: string;
  partySize: number;
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

/**
 * Generate a unique booking ID
 */
function generateBookingId(): string {
  // Generate a UUID and take the first 8 characters
  return `BK-${uuidv4().substring(0, 8).toUpperCase()}`;
}

// Extend the Booking type to include the new fields
export interface ExtendedBooking {
  _id: string;
  bookingId: string;
  fullName: string;
  email: string;
  date: string;
  time?: string;
  partySize: number;
  amount: number;
  status: "pending" | "confirmed" | "cancelled";
  paid: boolean;
  phoneNumber: string;
  language?: string;
  country: string;
  countryCode: string;
}

// Define the expected structure of the booking data
export interface BookingInputData extends Omit<Booking, "_id"> {
  time?: string;
  tourSlug?: string;
  tourName?: string;
  language?: string;
  country?: string;
  countryCode?: string;
}

export async function createBooking(bookingData: BookingInputData, paymentId: string): Promise<ExtendedBooking> {
  const db = await getDb();

  // Convert amount from cents to euros if needed
  let totalAmount = bookingData.amount;
  if (totalAmount > 100) {
    totalAmount = totalAmount / 100;
  }

  // Generate a unique booking ID
  const bookingId = generateBookingId();

  // Ensure country and countryCode are properly set with fallbacks
  const country = bookingData.country || "Unknown";
  const countryCode = bookingData.countryCode || "XX";

  const bookingDocument: Omit<BookingDocument, "_id"> = {
    bookingId, // Add the unique bookingId
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
    country: country,
    countryCode: countryCode
  };

  const result = await db.collection("bookings").insertOne(bookingDocument);

  return {
    _id: result.insertedId.toString(),
    bookingId: bookingDocument.bookingId,
    fullName: bookingDocument.fullName,
    email: bookingDocument.email,
    date: bookingDocument.date.toISOString(),
    time: bookingDocument.time,
    partySize: bookingDocument.partySize,
    amount: bookingDocument.totalAmount,
    status: bookingDocument.status,
    paid: bookingDocument.paymentStatus === "paid",
    phoneNumber: bookingDocument.phoneNumber,
    language: bookingDocument.language || "es",
    country: bookingDocument.country,
    countryCode: bookingDocument.countryCode
  };
}

export async function getBookingByPaymentIntent(paymentIntentId: string): Promise<ExtendedBooking | null> {
  const db = await getDb();
  const booking = await db.collection("bookings").findOne({ paymentIntentId });

  if (!booking) return null;

  return {
    _id: booking._id.toString(),
    bookingId: booking.bookingId,
    fullName: booking.fullName,
    email: booking.email,
    date: booking.date.toISOString(),
    time: booking.time,
    partySize: booking.partySize,
    amount: booking.totalAmount,
    status: booking.status,
    paid: booking.paymentStatus === "paid",
    phoneNumber: booking.phoneNumber,
    language: booking.language || "es",
    country: booking.country || "Unknown",
    countryCode: booking.countryCode || "XX",
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
