import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useState, useEffect } from "react";
import type { BookingData, PaginationInfo } from "~/types/booking";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import type { TourOption } from "~/routes/admin.dashboard.bookings.hooks";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CancellationDialog } from "~/components/ui/CancellationDialog";
import { CancellationResultDialog } from "~/components/ui/CancellationResultDialog";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

export type BookingLimit = {
  maxBookings: number;
  currentBookings: number;
};

export type CancellationResultType = {
  success: boolean;
  message: string;
  refundResult?: {
    success: boolean;
    refundId?: string;
    error?: string;
    mockResponse?: boolean;
  };
};

type AdminBookingsUIProps = {
  selectedDate: Date;
  bookings: BookingData[];
  bookingLimit: BookingLimit;
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
  tours: TourOption[];
  selectedTourSlug: string;
  selectedStatus: string;
  allDates: boolean;
  onDateChange: (date: Date) => void;
  onUpdateMaxBookings: (newMax: number) => void;
  onCancelBooking?: (bookingId: string, shouldRefund: boolean, reason: string) => Promise<CancellationResultType>;
  onPageChange: (page: number) => void;
  onTourChange: (tourSlug: string) => void;
  onStatusChange: (status: string) => void;
  onAllDatesChange: (allDates: boolean) => void;
  strings: Record<string, unknown>;
};

export const AdminBookingsUI = ({
  selectedDate,
  bookings,
  bookingLimit,
  pagination,
  isLoading,
  tours,
  selectedTourSlug,
  selectedStatus,
  allDates,
  onDateChange,
  onUpdateMaxBookings,
  onCancelBooking,
  onPageChange,
  onTourChange,
  onStatusChange,
  onAllDatesChange,
}: AdminBookingsUIProps) => {
  const [maxBookings, setMaxBookings] = useState(bookingLimit.maxBookings.toString());
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [cancellationResult, setCancellationResult] = useState<CancellationResultType | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  // Update maxBookings input when bookingLimit changes (e.g., when date changes)
  useEffect(() => {
    setMaxBookings(bookingLimit.maxBookings.toString());
  }, [bookingLimit.maxBookings]);

  // Calculate total people from all bookings
  const totalPeople = bookings.reduce((sum, booking) => {
    // Only count confirmed bookings
    if (booking.status === 'confirmed') {
      return sum + booking.numberOfPeople;
    }
    return sum;
  }, 0);

  const completionPercentage = bookingLimit.maxBookings !== null
    ? (bookingLimit.maxBookings === 0 ? 100 : Math.min(100, Math.round((totalPeople / bookingLimit.maxBookings) * 100)))
    : 0;

  const handleMaxBookingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string (for when user is typing) or non-negative numbers
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setMaxBookings(value);
    }
  };

  const handleUpdateMaxBookings = () => {
    const newMax = parseInt(maxBookings, 10);
    if (!isNaN(newMax) && newMax >= 0) {
      onUpdateMaxBookings(newMax);
    }
  };

  const handleTourChange = (value: string) => {
    onTourChange(value);
  };

  const handleCancelClick = (booking: BookingData) => {
    setSelectedBooking(booking);
    setShowCancellationDialog(true);
  };

  const handleConfirmCancellation = async (refund: boolean, reason: string) => {
    if (selectedBooking && onCancelBooking) {
      // Show loading toast
      const toastId = toast.loading("Processing cancellation...");
      
      try {
        // Call the cancellation function
        const result = await onCancelBooking(selectedBooking._id, refund, reason);
        
        // Ensure we have a valid result object before proceeding
        if (!result || typeof result !== 'object') {
          throw new Error("Invalid response from server");
        }
        
        // Update the result state and show dialog
        setCancellationResult({
          success: result.success || false,
          message: result.message || "Unknown response from server",
          refundResult: result.refundResult ? {
            ...result.refundResult,
            success: result.refundResult.success === true
          } : undefined
        });
        setShowResultDialog(true);
        
        // Show success or error toast
        if (result.success) {
          toast.success("Booking cancelled successfully", {
            id: toastId,
            icon: <CheckCircle2 className="h-4 w-4" />,
          });
        } else {
          toast.error(result.message || "Failed to cancel booking", {
            id: toastId,
            icon: <XCircle className="h-4 w-4" />,
          });
        }
      } catch (error) {
        console.error("Error during cancellation:", error);
        
        // Show error toast
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        toast.error(errorMessage, {
          id: toastId,
          icon: <XCircle className="h-4 w-4" />,
        });
        
        // Create a fallback error result to display in the dialog
        setCancellationResult({
          success: false,
          message: errorMessage,
        });
        setShowResultDialog(true);
      }
    }
    
    // Close the cancellation dialog
    setShowCancellationDialog(false);
  };

  const handleAllDatesChange = (checked: boolean) => {
    onAllDatesChange(checked);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Selector Card */}
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-lg sm:text-xl text-primary">Date & Tour Selection</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Date Picker */}
              <div>
                <Label htmlFor="date-picker" className="block text-sm font-medium mb-2">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && onDateChange(date)}
                  className="rounded-md border"
                  disabled={selectedStatus === "cancelled" && allDates}
                />
              </div>

              {/* Tour Selector */}
              <div>
                <Label htmlFor="tour-selector" className="block text-sm font-medium mb-2">Select Tour</Label>
                <Select value={selectedTourSlug || "all"} onValueChange={handleTourChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a tour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tours</SelectItem>
                    {tours.map((tour) => (
                      <SelectItem key={tour._id} value={tour.slug}>
                        {tour.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* All Dates Checkbox (only for cancelled bookings) */}
              {selectedStatus === "cancelled" && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant={allDates ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAllDatesChange(!allDates)}
                    className="h-8"
                  >
                    {allDates ? "✓ Show all dates" : "Show all dates"}
                  </Button>
                </div>
              )}

              {/* Booking Limit (only for confirmed bookings) */}
              {selectedStatus === "confirmed" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="max-bookings" className="text-sm font-medium">Max Bookings:</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="max-bookings"
                        type="number"
                        min="0"
                        value={maxBookings}
                        onChange={handleMaxBookingsChange}
                        className="w-20 h-8 text-right"
                      />
                      <Button 
                        onClick={handleUpdateMaxBookings} 
                        size="sm"
                        className="h-8"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        completionPercentage < 70 
                          ? 'bg-green-600' 
                          : completionPercentage < 90 
                            ? 'bg-yellow-400' 
                            : 'bg-red-600'
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-right">
                    {completionPercentage}% Full
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table Card */}
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-lg sm:text-xl text-primary">Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Status Tabs */}
            <div className="p-4 border-b border-gray-200 flex justify-center">
              <Tabs value={selectedStatus} onValueChange={onStatusChange} className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Tour</TableHead>
                    <TableHead className="text-center">People</TableHead>
                    {selectedStatus === "confirmed" ? (
                      <>
                        <TableHead className="text-center">Price</TableHead>
                        <TableHead className="text-center">Paid</TableHead>
                        <TableHead className="text-center">Method</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="text-center">Price</TableHead>
                        <TableHead className="text-center">Refund</TableHead>
                        <TableHead className="text-center">Date</TableHead>
                        <TableHead className="text-center">Reason</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={selectedStatus === "confirmed" ? 9 : 9} className="text-center py-4">
                        No bookings found for this {selectedStatus === "cancelled" && allDates ? "tour" : "date"}.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell className="font-medium">{booking.name}</TableCell>
                        <TableCell>{booking.email}</TableCell>
                        <TableCell>{booking.phoneNumber}</TableCell>
                        <TableCell>{booking.tourType}</TableCell>
                        <TableCell className="text-center">{booking.numberOfPeople}</TableCell>
                        
                        {selectedStatus === "confirmed" ? (
                          <>
                            <TableCell className="text-center">
                              {booking.amount ? `€${booking.amount.toFixed(2)}` : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {booking.paid ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {booking.paymentMethod ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  booking.paymentMethod === 'stripe' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : booking.paymentMethod === 'paypal'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1)}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Unknown
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {onCancelBooking && booking.status !== 'cancelled' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelClick(booking)}
                                  className="h-8"
                                >
                                  Cancel
                                </Button>
                              )}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="text-center">
                              {booking.amount ? `€${booking.amount.toFixed(2)}` : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {booking.refundIssued ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  No
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatDate(booking.date)}
                            </TableCell>
                            <TableCell className="text-center max-w-[200px] truncate" title={booking.cancellationReason || "No reason provided"}>
                              {booking.cancellationReason || "No reason provided"}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center p-4">
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, pagination.currentPage - 1))}
                    disabled={pagination.currentPage === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === pagination.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                    disabled={pagination.currentPage === pagination.totalPages || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Dialog */}
      {selectedBooking && (
        <CancellationDialog
          open={showCancellationDialog}
          onOpenChange={setShowCancellationDialog}
          onConfirm={handleConfirmCancellation}
          bookingId={selectedBooking._id}
          bookingReference={selectedBooking.name}
          amount={selectedBooking.amount}
          paymentMethod={selectedBooking.paymentMethod}
        />
      )}

      {/* Cancellation Result Dialog */}
      {cancellationResult && (
        <CancellationResultDialog
          open={showResultDialog}
          onOpenChange={setShowResultDialog}
          result={cancellationResult}
        />
      )}
    </div>
  );
};
