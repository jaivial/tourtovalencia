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
                      className="stroke-current text-primary"
                      strokeWidth="3"
                      strokeDasharray={`${completionPercentage}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-bold text-primary">{completionPercentage}%</span>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-600 text-center">
                  {bookingLimit.currentBookings} of {bookingLimit.maxBookings} places booked
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Daily Places Limit Card */}
          <Card className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-lg sm:text-xl text-primary">Daily Places Limit</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-6">
              <div className="w-full space-y-4">
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <Input
                    type="number"
                    value={maxBookings}
                    onChange={handleMaxBookingsChange}
                    min="0"
                    className="w-full sm:w-32 text-center"
                  />
                  <Button 
                    onClick={handleUpdateClick}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
                  >
                    Update
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
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
          <div className="min-w-[200px]">
            <table className="w-full">
              <thead className="bg-primary/5 border-b border-primary/10">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-primary">Name</th>
                  <th className="p-3 text-left text-sm font-medium text-primary">Email</th>
                  <th className="p-3 text-left text-sm font-medium text-primary">Phone</th>
                  <th className="p-3 text-left text-sm font-medium text-primary">People</th>
                  <th className="p-3 text-left text-sm font-medium text-primary">Status</th>
                  <th className="p-3 text-left text-sm font-medium text-primary">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-900">{booking.name}</td>
                    <td className="p-3 text-sm text-gray-900">{booking.email}</td>
                    <td className="p-3 text-sm text-gray-900">{booking.phoneNumber}</td>
                    <td className="p-3 text-sm text-gray-900">{booking.numberOfPeople}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.paid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
