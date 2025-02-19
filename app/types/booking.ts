export interface Booking {
  _id?: string;
  fullName: string;
  email: string;
  bookingDate: Date;
  partySize: number;
  amount: number;
  paymentId: string;
  status?: string;
  phoneNumber?: string;
  specialRequests?: string;
  paid?: boolean;
}

export interface BookingData {
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
}

export interface BookingLimit {
  maxBookings: number;
  currentBookings: number;
}

export interface LoaderData {
  bookings: BookingData[];
  limit: BookingLimit;
  selectedDate: string;
  error?: string;
}
