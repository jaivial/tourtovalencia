import { ObjectId } from "mongodb";
import { getDb } from "../utils/db.server";
import { refundPayPalPayment } from "../utils/paypal.server";

interface CancellationResult {
  success: boolean;
  message: string;
  refundResult?: {
    success: boolean;
    refundId?: string;
    error?: string;
    mockResponse?: boolean;
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
            
        console.log(`Processing PayPal refund for booking ${bookingId} with transaction ID ${booking.transactionId} for amount ${amount}`);
            
        // Process PayPal refund
        refundResult = await refundPayPalPayment(
          booking.transactionId,
          amount,
          cancellationReason
        );
        
        // If we got a mock response in development, log it
        if (refundResult.mockResponse) {
          console.log('Using mock refund response in development mode:', refundResult);
        }
        
        // Update booking with refund result
        await db.collection("bookings").updateOne(
          { _id: new ObjectId(bookingId) },
          { 
            $set: { 
              refundStatus: refundResult.success ? "completed" : "failed",
              refundId: refundResult.refundId,
              refundError: refundResult.error,
              refundedAt: refundResult.success ? new Date() : undefined,
              mockRefund: refundResult.mockResponse || false
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
        const errorMessage = !booking.paymentMethod 
          ? "Missing payment method" 
          : !booking.transactionId 
            ? `Missing transaction ID for ${booking.paymentMethod} payment` 
            : `Cannot process refund: Invalid payment method ${booking.paymentMethod}`;
            
        console.error(`Refund error for booking ${bookingId}:`, errorMessage);
        
        refundResult = {
          success: false,
          error: errorMessage
        };
        
        // Update booking with error information
        await db.collection("bookings").updateOne(
          { _id: new ObjectId(bookingId) },
          { 
            $set: { 
              refundStatus: "failed",
              refundError: errorMessage
            } 
          }
        );
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