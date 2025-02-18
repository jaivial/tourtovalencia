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
import { useState } from "react";

type Booking = {
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

type BookingLimit = {
  maxBookings: number;
  currentBookings: number;
};

type AdminBookingsUIProps = {
  selectedDate: Date;
  bookings: Booking[];
  bookingLimit: BookingLimit;
  isLoading: boolean;
  error: string | null;
  onDateChange: (date: Date) => void;
  onUpdateMaxBookings: (newMax: number) => void;
  strings: any;
};

export const AdminBookingsUI = ({
  selectedDate,
  bookings,
  bookingLimit,
  isLoading,
  error,
  onDateChange,
  onUpdateMaxBookings,
  strings,
}: AdminBookingsUIProps) => {
  const [maxBookings, setMaxBookings] = useState(bookingLimit.maxBookings.toString());

  const completionPercentage = bookingLimit.maxBookings > 0
    ? Math.round((bookingLimit.currentBookings / bookingLimit.maxBookings) * 100)
    : 0;

  const handleMaxBookingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxBookings(e.target.value);
  };

  const handleUpdateClick = () => {
    const newMax = parseInt(maxBookings);
    if (!isNaN(newMax) && newMax >= 0) {
      onUpdateMaxBookings(newMax);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-gray-100 min-h-screen">
      {/* Statistics Cards and Calendar Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
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
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                caption: "relative flex items-center justify-center py-2 border-b",
                caption_label: "text-sm font-medium",
                caption_dropdowns: "flex space-x-2",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray={`${completionPercentage}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{completionPercentage}%</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                {bookingLimit.currentBookings} of {bookingLimit.maxBookings} places booked
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Places Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  type="number"
                  value={maxBookings}
                  onChange={handleMaxBookingsChange}
                  min="0"
                  className="w-32"
                />
                <Button onClick={handleUpdateClick}>Update</Button>
              </div>
              <p className="text-sm text-gray-500">
                Current limit: {bookingLimit.maxBookings} places
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings for {selectedDate.toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500 py-4">{error}</p>
          ) : bookings.length === 0 ? (
            <p className="text-center py-4">No bookings for this date</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>People</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Special Requests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.name}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{booking.phoneNumber}</TableCell>
                    <TableCell>{booking.numberOfPeople}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.paid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </TableCell>
                    <TableCell>{booking.specialRequests || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
