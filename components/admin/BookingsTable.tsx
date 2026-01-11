import { format } from "date-fns";
import * as React from "react";

/**
 * STRICT interface for Booking
 */
export interface Booking {
  _id: string;
  name: string;
  email: string;
  date: string;
  tourType: string;
  numberOfPeople: number;
  status: 'confirmed' | 'pending';
  phoneNumber: string;
  specialRequests?: string;
}

/**
 * STRICT interface for BookingsTable props
 */
export interface BookingsTableProps {
  selectedDate: Date;
}

/**
 * BookingsTable component
 */
export const BookingsTable = ({ selectedDate }: BookingsTableProps) => {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(`/api/admin/bookings?date=${formattedDate}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-r-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-4">
        <p>No bookings found for this date.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">People</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Special Requests</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td className="px-6 py-4 whitespace-nowrap">{booking.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{booking.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{booking.tourType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">{booking.numberOfPeople}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{booking.phoneNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap">{booking.specialRequests || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
