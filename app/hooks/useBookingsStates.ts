import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { format } from "date-fns";

export type Booking = {
  _id: string;
  name: string;
  email: string;
  date: Date;
  tourType: string;
  numberOfPeople: number;
  status: "pending" | "confirmed" | "cancelled";
  phoneNumber: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BookingLimit = {
  maxBookings: number;
  currentBookings: number;
};

export const useBookingsStates = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState<string>("");

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    navigate(`?date=${format(date, 'yyyy-MM-dd')}`);
  };

  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: Implement delete functionality
    setIsDeleteModalOpen(false);
    setBookingToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setBookingToDelete(null);
  };

  const handleLimitChange = (value: string) => {
    setNewLimit(value);
  };

  const handleLimitUpdate = async () => {
    setIsUpdatingLimit(true);
    try {
      // TODO: Implement limit update functionality
    } catch (error) {
      console.error('Error updating limit:', error);
    } finally {
      setIsUpdatingLimit(false);
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    handleDateChange,
    isDeleteModalOpen,
    bookingToDelete,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    isUpdatingLimit,
    newLimit,
    handleLimitChange,
    handleLimitUpdate,
  };
}; 