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
import type { PaginationInfo } from "~/types/booking";

export type Booking = {
  _id: string;
  name: string;
  email: string;
  date: string;
  tourType: string;
  numberOfPeople: number;
  status: string;
  phoneNumber: string;
  specialRequests?: string;
  paid: boolean;
};

export type BookingLimit = {
  maxBookings: number;
  currentBookings: number;
};

type AdminBookingsUIProps = {
  selectedDate: Date;
  bookings: Booking[];
  bookingLimit: BookingLimit;
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
  onDateChange: (date: Date) => void;
  onUpdateMaxBookings: (newMax: number) => void;
  onCancelBooking?: (bookingId: string) => void;
  onPageChange: (page: number) => void;
  strings: Record<string, unknown>;
};

export const AdminBookingsUI = ({
  selectedDate,
  bookings,
  bookingLimit,
  pagination,
  isLoading,
  onDateChange,
  onUpdateMaxBookings,
  onCancelBooking,
  onPageChange,
}: AdminBookingsUIProps) => {
  const [maxBookings, setMaxBookings] = useState(bookingLimit.maxBookings.toString());

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

  const handleUpdateClick = () => {
    const newMax = parseInt(maxBookings);
    if (!isNaN(newMax) && newMax >= 0) {
      onUpdateMaxBookings(newMax);
    }
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const { currentPage, totalPages } = pagination;
    
    // If there's only one page, don't show pagination
    if (totalPages <= 1) return null;
    
    const buttons = [];
    
    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || isLoading}
        className="mx-1"
        aria-label="Previous page"
      >
        &lt;
      </Button>
    );
    
    // Page number buttons
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    // First page button (if not visible in the range)
    if (startPage > 1) {
      buttons.push(
        <Button
          key="first"
          variant={1 === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={isLoading}
          className="mx-1"
          aria-label="Go to first page"
        >
          1
        </Button>
      );
      
      // Ellipsis if there's a gap
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="mx-1">...</span>
        );
      }
    }
    
    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          disabled={isLoading}
          className="mx-1"
          aria-label={`Go to page ${i}`}
        >
          {i}
        </Button>
      );
    }
    
    // Last page button (if not visible in the range)
    if (endPage < totalPages) {
      // Ellipsis if there's a gap
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="mx-1">...</span>
        );
      }
      
      buttons.push(
        <Button
          key="last"
          variant={totalPages === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={isLoading}
          className="mx-1"
          aria-label="Go to last page"
        >
          {totalPages}
        </Button>
      );
    }
    
    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || isLoading}
        className="mx-1"
        aria-label="Next page"
      >
        &gt;
      </Button>
    );
    
    return (
      <div className="flex items-center justify-center mt-4 mb-2">
        {buttons}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-2 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Statistics Cards and Calendar Row */}
        <div className="grid grid-cols-1 gap-4 
          min-[200px]:grid-cols-1 min-[200px]:gap-2
          min-[300px]:grid-cols-1 min-[300px]:gap-3
          min-[500px]:grid-cols-2 min-[500px]:gap-3
          min-[800px]:grid-cols-3 min-[800px]:gap-4
          min-[1028px]:grid-cols-3 min-[1028px]:gap-6
          min-[1280px]:max-w-7xl min-[1280px]:mx-auto">
          
          {/* Calendar Card */}
          <Card className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-lg sm:text-xl text-primary">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateChange(date)}
                className="w-full"
                classNames={{
                  months: "w-full space-y-4",
                  month: "w-full space-y-4",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex w-full",
                  head_cell: "text-muted-foreground rounded-md w-full font-normal text-center",
                  row: "flex w-full mt-2",
                  cell: "text-center relative p-0 text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md h-9 w-full",
                  day: "h-9 w-9 p-0 font-normal text-center mx-auto flex items-center justify-center aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                  nav: "space-x-1 flex items-center justify-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  caption: "relative flex items-center justify-center py-2",
                  caption_label: "text-sm font-medium",
                }}
              />
            </CardContent>
          </Card>

          {/* Booking Completion Card */}
          <Card className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-lg sm:text-xl text-primary">Booking Completion</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="stroke-current text-gray-200"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className={`stroke-current ${
                        completionPercentage >= 100 
                          ? 'text-red-500' 
                          : completionPercentage >= 90 
                          ? 'text-yellow-500' 
                          : 'text-primary'
                      }`}
                      strokeWidth="3"
                      strokeDasharray={`${completionPercentage}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl sm:text-3xl font-bold ${
                      completionPercentage >= 100 
                        ? 'text-red-500' 
                        : completionPercentage >= 90 
                        ? 'text-yellow-500' 
                        : 'text-primary'
                    }`}>{completionPercentage}%</span>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center space-y-1">
                  <p className="text-sm sm:text-base text-gray-600">
                    {totalPeople} of {bookingLimit.maxBookings} places booked
                  </p>
                  {completionPercentage >= 100 && (
                    <p className="text-sm text-red-500 font-medium">
                      Overbooking!
                    </p>
                  )}
                  {completionPercentage >= 90 && completionPercentage < 100 && (
                    <p className="text-sm text-yellow-500 font-medium">
                      Almost full!
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Places Limit Card */}
          <Card className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-lg sm:text-xl text-primary">Daily Places Limit</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-xs mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <Input
                    type="number"
                    min="0"
                    value={maxBookings}
                    onChange={handleMaxBookingsChange}
                    className="w-full sm:w-32 text-center"
                    aria-label="Maximum bookings per day"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleUpdateClick}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Updating...</span>
                      </div>
                    ) : (
                      'Update'
                    )}
                  </Button>
                </div>
                <p className="text-sm sm:text-base text-gray-600 text-center">
                  Current limit: {bookingLimit.maxBookings} places
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Bookings for {selectedDate.toLocaleDateString()}
              </h2>
              <div className="text-sm text-gray-500">
                Showing {pagination.currentPage === pagination.totalPages ? 
                  (pagination.totalItems === 0 ? 0 : ((pagination.currentPage - 1) * pagination.itemsPerPage + 1) + '-' + pagination.totalItems) : 
                  ((pagination.currentPage - 1) * pagination.itemsPerPage + 1) + '-' + (pagination.currentPage * pagination.itemsPerPage)
                } of {pagination.totalItems} bookings
              </div>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Tour Type</TableHead>
                <TableHead>People</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No bookings found for this date
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="font-medium">{booking.name}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{booking.phoneNumber}</TableCell>
                    <TableCell>{booking.tourType}</TableCell>
                    <TableCell>{booking.numberOfPeople}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.status === 'cancelled' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.paid ? 'Paid' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Button>
                        {onCancelBooking && booking.status !== 'cancelled' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => onCancelBooking(booking._id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {renderPaginationButtons()}
        </div>
      </div>
    </div>
  );
};
