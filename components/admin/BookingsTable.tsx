import { useState, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Box,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { format } from 'date-fns';

interface Booking {
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

interface BookingsTableProps {
  selectedDate: Date;
}

export const BookingsTable = ({ selectedDate }: BookingsTableProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      <Box display="flex" justifyContent="center" alignItems="center" p={8}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  if (bookings.length === 0) {
    return (
      <Box p={4}>
        <Text>No bookings found for this date.</Text>
      </Box>
    );
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Tour Type</Th>
            <Th>People</Th>
            <Th>Status</Th>
            <Th>Phone</Th>
            <Th>Special Requests</Th>
          </Tr>
        </Thead>
        <Tbody>
          {bookings.map((booking) => (
            <Tr key={booking._id}>
              <Td>{booking.name}</Td>
              <Td>{booking.email}</Td>
              <Td>{booking.tourType}</Td>
              <Td isNumeric>{booking.numberOfPeople}</Td>
              <Td>
                <Badge
                  colorScheme={booking.status === 'confirmed' ? 'green' : 'yellow'}
                >
                  {booking.status}
                </Badge>
              </Td>
              <Td>{booking.phoneNumber}</Td>
              <Td>{booking.specialRequests || '-'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};