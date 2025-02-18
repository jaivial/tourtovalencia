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
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Date Selection */}
      <Card className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateChange(date)}
          className="rounded-md border"
        />
      </Card>

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
