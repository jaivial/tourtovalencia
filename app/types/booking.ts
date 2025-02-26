export interface Booking {
  fullName: string;
  email: string;
  date: string | Date;
  partySize: number;
  amount: number;
  paymentIntentId: string;
  phoneNumber: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus?: 'paid' | 'pending' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
  tourSlug?: string;
  tourName?: string;
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

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface LoaderData {
  bookings: BookingData[];
  limit: BookingLimit;
  selectedDate: string;
  pagination: PaginationInfo;
  tours?: Array<{ _id: string; slug: string; name: string }>;
  selectedTourSlug?: string;
  selectedStatus?: string;
  error?: string;
}
