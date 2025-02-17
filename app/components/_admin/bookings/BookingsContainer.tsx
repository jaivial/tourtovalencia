// Feature component: responsible for containing UI components and handling features
import { BookingsUI } from "./BookingsUI";
import { useBookingsContext } from "~/providers/BookingsContext";
import { useLoaderData } from "@remix-run/react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

export const BookingsContainer: React.FC = () => {
  const { state } = useBookingsContext();
  const { bookings, bookingLimit } = useLoaderData<{ bookings: any[], bookingLimit: any }>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Bookings Management</h1>
      
      <BookingsUI 
        bookings={bookings}
        bookingLimit={bookingLimit}
        selectedDate={state.selectedDate}
        onDateChange={state.handleDateChange}
        onDeleteClick={state.handleDeleteClick}
        newLimit={state.newLimit}
        onLimitChange={state.handleLimitChange}
        onLimitUpdate={state.handleLimitUpdate}
        isUpdatingLimit={state.isUpdatingLimit}
      />

      <AlertDialog 
        open={state.isDeleteModalOpen} 
        onOpenChange={() => state.handleDeleteCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking
              {state.bookingToDelete && ` for ${state.bookingToDelete.name}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={state.handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={state.handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 