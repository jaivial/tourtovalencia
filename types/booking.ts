export interface Booking {
  _id: string;
  name: string;
  email: string;
  date: string | Date;
  tourType: string;
  numberOfPeople: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  phoneNumber: string;
  specialRequests?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}