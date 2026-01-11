import { z } from 'zod';

export const adminLoginSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
});

export const adminAccountUpdateSchema = z.object({
  action: z.enum(['updateUsername', 'updatePassword']),
  newUsername: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "Password must contain at least one letter and one number")
    .optional(),
});

export const bookingSchema = z.object({
  fullName: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters"),
  email: z.string()
    .email("Invalid email address")
    .max(254, "Email is too long"),
  emailConfirm: z.string()
    .email("Invalid email address"),
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must not exceed 20 characters")
    .regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number format"),
  partySize: z.number()
    .int("Number of guests must be a whole number")
    .min(1, "At least 1 guest is required")
    .max(20, "Maximum 20 guests allowed"),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
  time: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, use HH:MM")
    .optional(),
  tourSlug: z.string()
    .min(1, "Tour selection is required")
    .max(100, "Tour slug is too long")
    .optional(),
  language: z.enum(["en", "es"])
    .optional(),
  country: z.string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must not exceed 100 characters")
    .optional(),
  countryCode: z.string()
    .min(2, "Country code must be at least 2 characters")
    .max(5, "Country code must not exceed 5 characters")
    .optional(),
});

export const bookingRefundSchema = z.object({
  bookingId: z.string()
    .min(1, "Booking ID is required"),
  reason: z.string()
    .min(10, "Refund reason must be at least 10 characters")
    .max(500, "Refund reason must not exceed 500 characters"),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string()
    .min(1, "Booking ID is required"),
  email: z.string()
    .email("Invalid email address"),
});

export const pageCreationSchema = z.object({
  name: z.string()
    .min(3, "Page name must be at least 3 characters")
    .max(100, "Page name must not exceed 100 characters"),
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  status: z.enum(["active", "upcoming"]),
  price: z.number()
    .min(0, "Price cannot be negative")
    .max(100000, "Price is too high")
});

export const bookingLimitSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
  maxBookings: z.number()
    .int("Max bookings must be a whole number")
    .min(1, "At least 1 booking must be allowed")
    .max(100, "Maximum 100 bookings allowed")
    .optional(),
  tourSlug: z.string()
    .min(1, "Tour slug is required")
    .max(100, "Tour slug is too long")
    .optional(),
});

export const pageUpdateSchema = z.object({
  pageId: z.string()
    .min(1, "Page ID is required"),
  content: z.record(z.string(), z.unknown()),
});

export const dateAvailabilitySchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
});
