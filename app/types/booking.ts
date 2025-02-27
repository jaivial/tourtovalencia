export interface Booking {
  _id: string;
  fullName: string;
  email: string;
  date: string | Date;
  partySize: number;
  amount: number;
  totalAmount?: number;
  paymentIntentId: string;
  phoneNumber: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus?: 'paid' | 'pending' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
  tourSlug?: string;
  tourName?: string;
  paymentMethod?: 'stripe' | 'paypal';
  transactionId?: string;
  refundIssued?: boolean;
  cancellationReason?: string;
  language?: string;
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
  countryCode: string;
  country: string;
  specialRequests?: string;
  paid: boolean;
  amount: number;
  paymentMethod?: string;
  refundIssued: boolean;
  cancellationReason: string;
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
  limit: {
    maxBookings: number;
    currentBookings: number;
  };
  selectedDate: string;
  pagination: PaginationInfo;
  tours: Array<{
    _id: string;
    slug: string;
    name: string;
  }>;
  selectedTourSlug: string;
  selectedStatus: string;
  allDates: boolean;
  searchTerm: string;
  error?: string;
}
