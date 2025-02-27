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
import { useState, useEffect, useCallback } from "react";
import type { BookingData, PaginationInfo } from "~/types/booking";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import type { TourOption } from "~/routes/admin.dashboard.bookings.hooks";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CancellationDialog } from "~/components/ui/CancellationDialog";
import { CancellationResultDialog } from "~/components/ui/CancellationResultDialog";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Search, Loader2 } from "lucide-react";

// Helper function to get country flag emoji from country code
const getCountryFlag = (countryCode?: string): string => {
  if (!countryCode) return '🌍';
  
  // Convert country code to flag emoji (each letter is converted to a regional indicator symbol emoji)
  return countryCode
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join('');
};

// Helper function to get country dial code from country code
const getCountryDialCode = (countryCode?: string): string => {
  if (!countryCode) return '';
  
  // Map of country codes to dial codes
  const dialCodes: Record<string, string> = {
    'AF': '+93', 'AL': '+355', 'DZ': '+213', 'AD': '+376', 'AO': '+244', 'AR': '+54', 'AM': '+374',
    'AU': '+61', 'AT': '+43', 'AZ': '+994', 'BS': '+1', 'BH': '+973', 'BD': '+880', 'BB': '+1',
    'BY': '+375', 'BE': '+32', 'BZ': '+501', 'BJ': '+229', 'BT': '+975', 'BO': '+591', 'BA': '+387',
    'BW': '+267', 'BR': '+55', 'BN': '+673', 'BG': '+359', 'BF': '+226', 'BI': '+257', 'KH': '+855',
    'CM': '+237', 'CA': '+1', 'CV': '+238', 'CF': '+236', 'TD': '+235', 'CL': '+56', 'CN': '+86',
    'CO': '+57', 'KM': '+269', 'CD': '+243', 'CG': '+242', 'CR': '+506', 'CI': '+225', 'HR': '+385',
    'CU': '+53', 'CY': '+357', 'CZ': '+420', 'DK': '+45', 'DJ': '+253', 'DM': '+1', 'DO': '+1',
    'EC': '+593', 'EG': '+20', 'SV': '+503', 'GQ': '+240', 'ER': '+291', 'EE': '+372', 'ET': '+251',
    'FJ': '+679', 'FI': '+358', 'FR': '+33', 'GA': '+241', 'GM': '+220', 'GE': '+995', 'DE': '+49',
    'GH': '+233', 'GR': '+30', 'GT': '+502', 'GN': '+224', 'GW': '+245', 'GY': '+592', 'HT': '+509',
    'HN': '+504', 'HK': '+852', 'HU': '+36', 'IS': '+354', 'IN': '+91', 'ID': '+62', 'IR': '+98',
    'IQ': '+964', 'IE': '+353', 'IL': '+972', 'IT': '+39', 'JM': '+1', 'JP': '+81', 'JO': '+962',
    'KZ': '+7', 'KE': '+254', 'KI': '+686', 'KP': '+850', 'KR': '+82', 'KW': '+965', 'KG': '+996',
    'LA': '+856', 'LV': '+371', 'LB': '+961', 'LS': '+266', 'LR': '+231', 'LY': '+218', 'LI': '+423',
    'LT': '+370', 'LU': '+352', 'MK': '+389', 'MG': '+261', 'MW': '+265', 'MY': '+60', 'MV': '+960',
    'ML': '+223', 'MT': '+356', 'MH': '+692', 'MR': '+222', 'MU': '+230', 'MX': '+52', 'FM': '+691',
    'MD': '+373', 'MC': '+377', 'MN': '+976', 'ME': '+382', 'MA': '+212', 'MZ': '+258', 'MM': '+95',
    'NA': '+264', 'NR': '+674', 'NP': '+977', 'NL': '+31', 'NZ': '+64', 'NI': '+505', 'NE': '+227',
    'NG': '+234', 'NO': '+47', 'OM': '+968', 'PK': '+92', 'PW': '+680', 'PA': '+507', 'PG': '+675',
    'PY': '+595', 'PE': '+51', 'PH': '+63', 'PL': '+48', 'PT': '+351', 'QA': '+974', 'RO': '+40',
    'RU': '+7', 'RW': '+250', 'KN': '+1', 'LC': '+1', 'VC': '+1', 'WS': '+685', 'SM': '+378',
    'ST': '+239', 'SA': '+966', 'SN': '+221', 'RS': '+381', 'SC': '+248', 'SL': '+232', 'SG': '+65',
    'SK': '+421', 'SI': '+386', 'SB': '+677', 'SO': '+252', 'ZA': '+27', 'ES': '+34', 'LK': '+94',
    'SD': '+249', 'SR': '+597', 'SZ': '+268', 'SE': '+46', 'CH': '+41', 'SY': '+963', 'TW': '+886',
    'TJ': '+992', 'TZ': '+255', 'TH': '+66', 'TL': '+670', 'TG': '+228', 'TO': '+676', 'TT': '+1',
    'TN': '+216', 'TR': '+90', 'TM': '+993', 'TV': '+688', 'UG': '+256', 'UA': '+380', 'AE': '+971',
    'GB': '+44', 'US': '+1', 'UY': '+598', 'UZ': '+998', 'VU': '+678', 'VA': '+39', 'VE': '+58',
    'VN': '+84', 'YE': '+967', 'ZM': '+260', 'ZW': '+263'
  };
  
  return dialCodes[countryCode.toUpperCase()] || '';
};

export type BookingLimit = {
  maxBookings: number;
  currentBookings: number;
};

export type CancellationResultType = {
  success: boolean;
  message: string;
  refundResult?: {
    success: boolean;
    refundId?: string;
    error?: string;
    mockResponse?: boolean;
  };
};

type AdminBookingsUIProps = {
  selectedDate: Date;
  bookings: BookingData[];
  bookingLimit: BookingLimit;
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
  tours: TourOption[];
  selectedTourSlug: string;
  selectedStatus: string;
  allDates: boolean;
  searchTerm: string;
  onDateChange: (date: Date) => void;
  onUpdateMaxBookings: (newMax: number) => void;
  onCancelBooking?: (bookingId: string, shouldRefund: boolean, reason: string) => Promise<CancellationResultType>;
  onPageChange: (page: number) => void;
  onTourChange: (tourSlug: string) => void;
  onStatusChange: (status: string) => void;
  onAllDatesChange: (allDates: boolean) => void;
  onSearchChange: (searchTerm: string) => void;
  strings: Record<string, string>;
};

export const AdminBookingsUI = ({
  selectedDate,
  bookings,
  bookingLimit,
  pagination,
  isLoading,
  tours,
  selectedTourSlug,
  selectedStatus,
  allDates,
  searchTerm,
  onDateChange,
  onUpdateMaxBookings,
  onCancelBooking,
  onPageChange,
  onTourChange,
  onStatusChange,
  onAllDatesChange,
  onSearchChange,
  strings
}: AdminBookingsUIProps) => {
  const [maxBookings, setMaxBookings] = useState(bookingLimit.maxBookings.toString());
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [cancellationResult, setCancellationResult] = useState<CancellationResultType | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Update maxBookings input when bookingLimit changes (e.g., when date changes)
  useEffect(() => {
    setMaxBookings(bookingLimit.maxBookings.toString());
  }, [bookingLimit.maxBookings]);

  // Update localSearchTerm when searchTerm prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Debounced search function
  const debouncedSearch = useCallback((term: string) => {
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set a new timeout with a longer delay
    const timeout = setTimeout(() => {
      onSearchChange(term);
    }, 500); // Increased from 300ms to 500ms for more fluid typing
    
    setSearchTimeout(timeout);
  }, [onSearchChange, searchTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Calculate total people from all bookings
  const totalPeople = bookings.reduce((sum, booking) => {
    // Only count confirmed bookings
    if (booking.status === 'confirmed') {
      return sum + booking.numberOfPeople;
    }
    return sum;
  }, 0);

  const completionPercentage = bookingLimit.maxBookings !== null
    ? (bookingLimit.maxBookings === 0 ? 100 : Math.min(100, Math.round((totalPeople / bookingLimit.maxBookings) * 100)))
    : 0;

  const handleMaxBookingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string (for when user is typing) or non-negative numbers
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setMaxBookings(value);
    }
  };

  const handleUpdateMaxBookings = () => {
    const newMax = parseInt(maxBookings, 10);
    if (!isNaN(newMax) && newMax >= 0) {
      onUpdateMaxBookings(newMax);
    }
  };

  const handleTourChange = (value: string) => {
    onTourChange(value);
  };

  const handleCancelClick = (booking: BookingData) => {
    setSelectedBooking(booking);
    setShowCancellationDialog(true);
  };

  const handleConfirmCancellation = async (refund: boolean, reason: string) => {
    if (selectedBooking && onCancelBooking) {
      // Show loading toast
      const toastId = toast.loading("Procesando cancelación...");
      
      try {
        // Call the cancellation function
        const result = await onCancelBooking(selectedBooking._id, refund, reason);
        
        // Ensure we have a valid result object before proceeding
        if (!result || typeof result !== 'object') {
          throw new Error("Respuesta inválida del servidor");
        }
        
        // Update the result state and show dialog
        setCancellationResult({
          success: result.success || false,
          message: result.message || "Respuesta desconocida del servidor",
          refundResult: result.refundResult ? {
            ...result.refundResult,
            success: result.refundResult.success === true
          } : undefined
        });
        setShowResultDialog(true);
        
        // Show success or error toast
        if (result.success) {
          toast.success("Reserva cancelada exitosamente", {
            id: toastId,
            icon: <CheckCircle2 className="h-4 w-4" />,
          });
        } else {
          toast.error(result.message || "Error al cancelar la reserva", {
            id: toastId,
            icon: <XCircle className="h-4 w-4" />,
          });
        }
      } catch (error) {
        console.error("Error durante la cancelación:", error);
        
        // Show error toast
        const errorMessage = error instanceof Error ? error.message : "Ocurrió un error";
        toast.error(errorMessage, {
          id: toastId,
          icon: <XCircle className="h-4 w-4" />,
        });
        
        // Create a fallback error result to display in the dialog
        setCancellationResult({
          success: false,
          message: errorMessage,
        });
        setShowResultDialog(true);
      }
    }
    
    // Close the cancellation dialog
    setShowCancellationDialog(false);
  };

  const handleAllDatesChange = (checked: boolean) => {
    onAllDatesChange(checked);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setLocalSearchTerm(newSearchTerm);
    
    // Only trigger search if term is at least 2 characters or empty (clearing search)
    if (newSearchTerm.length >= 2 || newSearchTerm === '') {
      debouncedSearch(newSearchTerm);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    onSearchChange('');
    // Clear any pending search timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Date Selector Card */}
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-lg sm:text-xl text-primary">{strings.dateAndTourSelection}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center md:items-stretch md:flex-row md:justify-center md:space-x-8 lg:space-x-12">
              {/* Date Picker */}
              <div className="w-full max-w-xs flex flex-col items-center mb-8 md:mb-0">
                <Label htmlFor="date-picker" className="self-start text-sm font-medium mb-3">{strings.selectDate}</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && onDateChange(date)}
                  className="rounded-md border shadow-sm"
                  disabled={selectedStatus === "cancelled" && allDates}
                />
              </div>

              {/* Tour Selector and All Dates/Booking Limit */}
              <div className="w-full max-w-xs flex flex-col">
                {/* Tour Selector */}
                <div className="mb-6">
                  <Label htmlFor="tour-selector" className="block text-sm font-medium mb-3">{strings.selectTour}</Label>
                  <Select value={selectedTourSlug || "all"} onValueChange={handleTourChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={strings.selectTour} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{strings.allTours}</SelectItem>
                      {tours.map((tour) => (
                        <SelectItem key={tour._id} value={tour.slug}>
                          {tour.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* All Dates Button (for both cancelled and confirmed bookings) */}
                <div>
                  <Label className="block text-sm font-medium mb-3">{strings.dateFilter}</Label>
                  <Button
                    variant={allDates ? "default" : "outline"}
                    onClick={() => handleAllDatesChange(!allDates)}
                    className="w-full"
                  >
                    {allDates ? `✓ ${strings.showAllDates}` : strings.showAllDates}
                  </Button>
                </div>

                {/* Booking Limit (only for confirmed bookings) */}
                {selectedStatus === "confirmed" && (
                  <div className="space-y-4 mt-6">
                    <div>
                      <Label htmlFor="max-bookings" className="block text-sm font-medium mb-3">{strings.maxBookings}</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="max-bookings"
                          type="number"
                          min="0"
                          value={maxBookings}
                          onChange={handleMaxBookingsChange}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleUpdateMaxBookings} 
                          className="whitespace-nowrap"
                        >
                          {strings.update}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{strings.current}: {totalPeople} {strings.people}</span>
                        <span>{completionPercentage}% {strings.full}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            completionPercentage < 70 
                              ? 'bg-green-600' 
                              : completionPercentage < 90 
                                ? 'bg-yellow-400' 
                                : 'bg-red-600'
                          }`}
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table Card */}
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-lg sm:text-xl text-primary">{strings.bookings}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Status Tabs */}
            <div className="p-4 border-b border-gray-200 flex justify-center">
              <Tabs value={selectedStatus} onValueChange={onStatusChange} className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="confirmed">{strings.confirmed}</TabsTrigger>
                  <TabsTrigger value="cancelled">{strings.cancelled}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <Input
                  type="text"
                  placeholder={strings.searchByName}
                  value={localSearchTerm}
                  onChange={handleSearchInputChange}
                  className="pl-10 w-full"
                  disabled={isLoading}
                />
                {localSearchTerm && !isLoading && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <XCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {searchTerm && (
                <div className="p-2 bg-blue-50 text-blue-700 text-sm flex items-center justify-between">
                  <span>
                    <Search className="h-3 w-3 inline mr-1" />
                    {strings.showingResultsFor}: <strong>{searchTerm}</strong>
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearSearch}
                    className="h-6 text-xs"
                  >
                    {strings.clearSearch}
                  </Button>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">{strings.name}</TableHead>
                    <TableHead>{strings.email}</TableHead>
                    <TableHead>{strings.phone}</TableHead>
                    <TableHead>{strings.nationality}</TableHead>
                    <TableHead>{strings.tour}</TableHead>
                    <TableHead className="text-center">{strings.people}</TableHead>
                    {selectedStatus === "confirmed" ? (
                      <>
                        <TableHead className="text-center">{strings.price}</TableHead>
                        <TableHead className="text-center">{strings.paid}</TableHead>
                        <TableHead className="text-center">{strings.method}</TableHead>
                        <TableHead className="text-right">{strings.actions}</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="text-center">{strings.price}</TableHead>
                        <TableHead className="text-center">{strings.refund}</TableHead>
                        <TableHead className="text-center">{strings.date}</TableHead>
                        <TableHead className="text-center">{strings.reason}</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={selectedStatus === "confirmed" ? 10 : 10} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                          <span className="text-sm text-muted-foreground">{strings.searchingBookings}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={selectedStatus === "confirmed" ? 10 : 10} className="text-center py-4">
                        {searchTerm ? (
                          <span>{strings.noBookingsMatchingSearch} &ldquo;{searchTerm}&rdquo;</span>
                        ) : (
                          <span>{strings.noBookingsFound} {selectedStatus === "cancelled" && allDates ? strings.tour.toLowerCase() : strings.date.toLowerCase()}.</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell className="font-medium">{booking.name}</TableCell>
                        <TableCell>{booking.email}</TableCell>
                        <TableCell>
                          {booking.countryCode ? (
                            <span className="whitespace-nowrap">
                              <span className="text-gray-500 mr-1">
                                {getCountryDialCode(booking.countryCode)}
                              </span>
                              {booking.phoneNumber}
                            </span>
                          ) : (
                            booking.phoneNumber
                          )}
                        </TableCell>
                        <TableCell>
                          {booking.country && (
                            <span className="flex items-center">
                              <span className="mr-1">{getCountryFlag(booking.countryCode)}</span>
                              {booking.country}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{booking.tourType}</TableCell>
                        <TableCell className="text-center">{booking.numberOfPeople}</TableCell>
                        
                        {selectedStatus === "confirmed" ? (
                          <>
                            <TableCell className="text-center">
                              {booking.amount ? `${booking.amount.toFixed(2)}€` : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {booking.paid ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {strings.paid}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {strings.pending}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {booking.paymentMethod ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  booking.paymentMethod === 'stripe' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : booking.paymentMethod === 'paypal'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1)}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {strings.unknown}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {onCancelBooking && booking.status !== 'cancelled' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelClick(booking)}
                                  className="h-8"
                                >
                                  {strings.cancel}
                                </Button>
                              )}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="text-center">
                              {booking.amount ? `${booking.amount.toFixed(2)}€` : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {booking.refundIssued ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {strings.yes}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {strings.no}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatDate(booking.date)}
                            </TableCell>
                            <TableCell className="text-center max-w-[200px] truncate" title={booking.cancellationReason || strings.noReasonProvided}>
                              {booking.cancellationReason || strings.noReasonProvided}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && bookings.length > 0 && (
              <div className="flex justify-center p-4">
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, pagination.currentPage - 1))}
                    disabled={pagination.currentPage === 1 || isLoading}
                  >
                    {strings.previous}
                  </Button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === pagination.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                    disabled={pagination.currentPage === pagination.totalPages || isLoading}
                  >
                    {strings.next}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Dialog */}
      {selectedBooking && (
        <CancellationDialog
          open={showCancellationDialog}
          onOpenChange={setShowCancellationDialog}
          onConfirm={handleConfirmCancellation}
          bookingId={selectedBooking._id}
          bookingReference={selectedBooking.name}
          amount={selectedBooking.amount}
          paymentMethod={selectedBooking.paymentMethod}
          strings={strings}
        />
      )}

      {/* Cancellation Result Dialog */}
      {cancellationResult && (
        <CancellationResultDialog
          open={showResultDialog}
          onOpenChange={setShowResultDialog}
          result={cancellationResult}
          strings={strings}
        />
      )}
    </div>
  );
};
