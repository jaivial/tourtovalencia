// UI Component: responsible for displaying pure html with props passed from feature component
import * as React from "react";
import { Calendar } from "~/components/ui/calendar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Trash2, Download } from "lucide-react";
import { format } from "date-fns";
import { Booking, BookingLimit } from "~/hooks/useBookingsStates";

interface BookingsUIProps {
  bookings: Booking[];
  bookingLimit: BookingLimit;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onDeleteClick: (booking: Booking) => void;
  newLimit: string;
  onLimitChange: (value: string) => void;
  onLimitUpdate: () => void;
  isUpdatingLimit: boolean;
}

export const BookingsUI: React.FC<BookingsUIProps> = ({
  bookings,
  bookingLimit,
  selectedDate,
  onDateChange,
  onDeleteClick,
  newLimit,
  onLimitChange,
  onLimitUpdate,
  isUpdatingLimit,
}) => {
  return (
    <div className="space-y-8">
      {/* Date Selection */}
      <div className="flex flex-col md:flex-row gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Select Date</h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
            className="rounded-md border"
          />
        </div>

        {/* Daily Limit Section */}
        <div className="bg-white p-6 rounded-lg shadow-md flex-1 max-w-md">
          <h2 className="text-lg font-semibold mb-4">Daily Reservation Limit</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Bookings</p>
              <p className="text-2xl font-bold">{bookingLimit.currentBookings} / {bookingLimit.maxBookings}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newLimit">New Daily Limit</Label>
              <Input
                id="newLimit"
                type="number"
                value={newLimit}
                onChange={(e) => onLimitChange(e.target.value)}
                min="0"
                className="w-full"
              />
              <Button 
                onClick={onLimitUpdate}
                disabled={isUpdatingLimit || !newLimit}
                className="w-full"
              >
                {isUpdatingLimit ? "Updating..." : "Update Limit"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Bookings for {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Tour</TableHead>
              <TableHead>People</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell>{booking.name}</TableCell>
                <TableCell>{booking.email}</TableCell>
                <TableCell>{booking.phoneNumber}</TableCell>
                <TableCell>{booking.tourType}</TableCell>
                <TableCell>{booking.numberOfPeople}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteClick(booking)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No bookings found for this date
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}; 