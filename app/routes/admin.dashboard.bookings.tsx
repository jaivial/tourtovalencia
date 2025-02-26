// @ts-expect-error - Remix types compatibility
import { json } from "@remix-run/node";
// @ts-expect-error - Remix types compatibility
import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { AdminBookingsFeature } from "~/components/features/AdminBookingsFeature";
import { getDb, getToursCollection } from "~/utils/db.server";
import { getLocalMidnight, getLocalEndOfDay, formatLocalDate, parseLocalDate } from "~/utils/date";
import type { LoaderData, BookingData, PaginationInfo } from "~/types/booking";
import { updateBookingLimit } from "~/models/bookingLimit.server";
import { cancelBooking } from "~/services/bookingCancellation.server";
// import type { Tour } from "~/routes/book";
import { useState, useEffect } from "react";

// Número de reservas por página
const ITEMS_PER_PAGE = 10;
const DEFAULT_BOOKING_LIMIT = 10;

export const loader = async ({ request }: LoaderArgs) => {
  try {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    const pageParam = url.searchParams.get("page");
    const tourSlugParam = url.searchParams.get("tourSlug");
    const statusParam = url.searchParams.get("status") || "confirmed";
    const allDatesParam = url.searchParams.get("allDates") === "true";
    const searchTermParam = url.searchParams.get("searchTerm") || "";
    
    // Analizar número de página, por defecto 1 si es inválido
    const currentPage = pageParam ? Math.max(1, parseInt(pageParam)) : 1;

    // Crear un objeto de fecha que representa la medianoche en la zona horaria local
    let selectedDate: Date;
    if (dateParam) {
      selectedDate = parseLocalDate(dateParam);
    } else {
      // Para hoy, usar la fecha local actual a medianoche
      selectedDate = getLocalMidnight(new Date());
    }

    // Asegurar que la fecha es válida
    if (isNaN(selectedDate.getTime())) {
      throw new Error("Parámetro de fecha inválido");
    }

    const db = await getDb();

    // Obtener todos los tours
    const toursCollection = await getToursCollection();
    const tours = await toursCollection.find({ status: 'active' }).toArray();

    // Formatear tours para la UI
    const formattedTours = tours.map(tour => ({
      _id: tour._id.toString(),
      slug: tour.slug,
      name: tour.tourName?.en || tour.slug,
    }));

    // Crear objetos de fecha para el inicio y fin del día seleccionado en zona horaria local
    const startDate = selectedDate; // Ya está a medianoche
    const endDate = getLocalEndOfDay(selectedDate);

    // Construir consulta para reservas
    interface BookingQuery {
      status: string;
      tourSlug?: string;
      date?: {
        $gte: Date;
        $lte: Date;
      };
      $or?: Array<{
        fullName?: {
          $regex: string;
          $options: string;
        };
        name?: {
          $regex: string;
          $options: string;
        };
      }>;
    }

    const bookingsQuery: BookingQuery = {
      status: statusParam
    };

    // Solo filtrar por fecha si no se están viendo todas las reservas canceladas o confirmadas
    if (!((statusParam === "cancelled" || statusParam === "confirmed") && allDatesParam)) {
      bookingsQuery.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Si se selecciona un tour, filtrar reservas por tour
    if (tourSlugParam) {
      bookingsQuery.tourSlug = tourSlugParam;
    }

    // Si se proporciona un término de búsqueda, añadirlo a la consulta
    if (searchTermParam) {
      bookingsQuery.$or = [
        { fullName: { $regex: searchTermParam, $options: 'i' } },
        { name: { $regex: searchTermParam, $options: 'i' } }
      ];
    }

    // Obtener el recuento total de reservas para la fecha seleccionada y tour (si se especifica)
    const totalBookings = await db
      .collection("bookings")
      .countDocuments(bookingsQuery);

    // Calcular información de paginación
    const totalPages = Math.max(1, Math.ceil(totalBookings / ITEMS_PER_PAGE));
    const validatedPage = Math.min(currentPage, totalPages);
    const skip = (validatedPage - 1) * ITEMS_PER_PAGE;

    // Obtener reservas paginadas para la fecha seleccionada y tour (si se especifica)
    const bookings = await db
      .collection("bookings")
      .find(bookingsQuery)
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .toArray();

    // Obtener límite de reservas para la fecha seleccionada y tour (si se especifica)
    interface LimitQuery {
      date: { 
        $gte: Date; 
        $lte: Date;
      };
      tourSlug?: string;
    }

    const limitQuery: LimitQuery = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (tourSlugParam) {
      limitQuery.tourSlug = tourSlugParam;
    }

    const limitDoc = await db.collection("bookingLimits").findOne(limitQuery);

    const processedBookings: BookingData[] = bookings.map((booking) => {
      // Obtener número de teléfono de cualquiera de los campos
      const phoneNumber = booking.phoneNumber || booking.phone || "";
      
      // Obtener cantidad de totalAmount o amount y convertir de céntimos a euros si es necesario
      let amount = 0;
      if (booking.totalAmount !== undefined) {
        // Si totalAmount existe, usarlo (ya debería estar en euros)
        amount = booking.totalAmount;
      } else if (booking.amount !== undefined) {
        // Si amount existe, usarlo (podría estar en céntimos o euros)
        amount = booking.amount > 100 ? booking.amount / 100 : booking.amount;
      }
      
      return {
        _id: booking._id.toString(),
        name: booking.fullName || booking.name || "",
        email: booking.email || "",
        date: booking.date.toISOString(),
        tourType: booking.tourName || booking.tourType || "",
        numberOfPeople: Number(booking.partySize || booking.numberOfPeople) || 1,
        status: booking.status || "pending",
        phoneNumber: phoneNumber,  // Usar el número de teléfono extraído
        specialRequests: booking.specialRequests,
        paid: booking.paymentStatus === "paid" || Boolean(booking.paid),
        amount: amount,
        paymentMethod: booking.paymentMethod || undefined,
        refundIssued: booking.refundIssued || false,
        cancellationReason: booking.cancellationReason || "",
      };
    });

    // Formatear la fecha como YYYY-MM-DD para evitar problemas de zona horaria
    const formattedDate = formatLocalDate(selectedDate);

    // Crear información de paginación
    const paginationInfo: PaginationInfo = {
      currentPage: validatedPage,
      totalPages,
      totalItems: totalBookings,
      itemsPerPage: ITEMS_PER_PAGE
    };

    return json<LoaderData>({
      bookings: processedBookings,
      limit: {
        maxBookings: limitDoc?.maxBookings ?? DEFAULT_BOOKING_LIMIT,
        currentBookings: totalBookings,
      },
      selectedDate: formattedDate,
      pagination: paginationInfo,
      tours: formattedTours,
      selectedTourSlug: tourSlugParam || "",
      selectedStatus: statusParam,
      allDates: allDatesParam,
      searchTerm: searchTermParam,
    });
  } catch (error) {
    console.error("Error al cargar reservas:", error);
    const today = getLocalMidnight(new Date());
    const formattedDate = formatLocalDate(today);

    // Obtener todos los tours incluso en caso de error
    const toursCollection = await getToursCollection();
    const tours = await toursCollection.find({ status: 'active' }).toArray();
    const formattedTours = tours.map(tour => ({
      _id: tour._id.toString(),
      slug: tour.slug,
      name: tour.tourName?.en || tour.slug,
    }));

    return json<LoaderData>({
      bookings: [],
      limit: {
        maxBookings: DEFAULT_BOOKING_LIMIT,
        currentBookings: 0,
      },
      selectedDate: formattedDate,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: ITEMS_PER_PAGE
      },
      tours: formattedTours,
      selectedTourSlug: "",
      selectedStatus: "confirmed",
      allDates: false,
      searchTerm: "",
      error: "Error al cargar reservas",
    });
  }
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateLimit") {
    const date = formData.get("date");
    const maxBookings = formData.get("maxBookings");
    const tourSlug = formData.get("tourSlug");

    if (!date || !maxBookings) {
      return json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    try {
      const result = await updateBookingLimit(
        new Date(date.toString()), 
        parseInt(maxBookings.toString()), 
        tourSlug ? tourSlug.toString() : "default"
      );

      if (result.success) {
        return json({
          success: true,
          message: "Límite de reservas actualizado correctamente",
          data: result.data,
        });
      } else {
        return json({ error: "Error al actualizar el límite de reservas" }, { status: 500 });
      }
    } catch (error) {
      console.error("Error al actualizar el límite de reservas:", error);
      return json({ error: "Error al actualizar el límite de reservas" }, { status: 500 });
    }
  }
  
  if (intent === "cancelBooking") {
    const bookingId = formData.get("bookingId");
    const shouldRefund = formData.get("shouldRefund") === "true";
    const cancellationReason = formData.get("reason")?.toString() || "Cancelado por administrador";
    
    if (!bookingId) {
      return json({ error: "Falta ID de reserva" }, { status: 400 });
    }
    
    try {
      // Usar el nuevo servicio cancelBooking
      const result = await cancelBooking(
        bookingId.toString(),
        shouldRefund,
        cancellationReason
      );
      
      if (!result.success) {
        return json({ error: result.message }, { status: 500 });
      }
      
      return json({
        success: true,
        message: result.message,
        refundResult: result.refundResult
      });
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      return json({ error: "Error al cancelar reserva" }, { status: 500 });
    }
  }

  return json({ error: "Intent inválido" }, { status: 400 });
};

export default function AdminDashboardBookings() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [isSearching, setIsSearching] = useState(false);

  // Strings for UI components in Spanish
  const strings = {
    dateAndTourSelection: "Selección de Fecha y Tour",
    selectDate: "Seleccionar Fecha",
    selectTour: "Seleccionar Tour",
    allTours: "Todos los Tours",
    dateFilter: "Filtro de Fecha",
    showAllDates: "Mostrar todas las fechas",
    maxBookings: "Reservas Máximas",
    update: "Actualizar",
    current: "Actual",
    people: "Personas",
    full: "Lleno",
    bookings: "Reservas",
    confirmed: "Confirmadas",
    cancelled: "Canceladas",
    searchByName: "Buscar por nombre...",
    clearSearch: "Limpiar búsqueda",
    showingResultsFor: "Mostrando resultados para",
    name: "Nombre",
    email: "Correo",
    phone: "Teléfono",
    tour: "Tour",
    price: "Precio",
    paid: "Pagado",
    pending: "Pendiente",
    method: "Método",
    actions: "Acciones",
    cancel: "Cancelar",
    refund: "Reembolso",
    date: "Fecha",
    reason: "Motivo",
    yes: "Sí",
    no: "No",
    noReasonProvided: "No se proporcionó motivo",
    searchingBookings: "Buscando reservas...",
    noBookingsFound: "No se encontraron reservas para esta",
    noBookingsMatchingSearch: "No se encontraron reservas que coincidan con",
    previous: "Anterior",
    next: "Siguiente",
    cancelBooking: "Cancelar Reserva",
    areYouSureCancel: "¿Está seguro de que desea cancelar la reserva",
    issueRefundOf: "Emitir reembolso de",
    via: "vía",
    cancellationReason: "Motivo de cancelación",
    enterReasonForCancellation: "Ingrese el motivo de la cancelación",
    reasonIncludedInEmail: "Este motivo se incluirá en el correo electrónico de cancelación enviado al cliente.",
    confirmCancellation: "Confirmar Cancelación",
    bookingCancelledSuccessfully: "Reserva Cancelada Exitosamente",
    cancellationFailed: "Cancelación Fallida",
    refundProcessed: "Reembolso Procesado",
    refundFailed: "Reembolso Fallido",
    refundProcessedSuccessfully: "El reembolso ha sido procesado correctamente.",
    refundSimulatedSuccessfully: "El reembolso ha sido simulado correctamente.",
    unknownErrorRefund: "Ocurrió un error desconocido al procesar el reembolso.",
    refundId: "ID de Reembolso",
    simulatedRefund: "Este es un reembolso simulado en modo de desarrollo.",
    customerWillReceiveEmail: "El cliente recibirá una notificación por correo electrónico sobre esta cancelación.",
    tryAgainOrContact: "Intente nuevamente o contacte con soporte técnico si el problema persiste.",
    close: "Cerrar",
    unknown: "Desconocido",
    cancelledByAdmin: "Cancelado por administrador"
  };

  const handleDateChange = (date: Date) => {
    // Formatear la fecha como YYYY-MM-DD en zona horaria local
    const formattedDate = formatLocalDate(date);

    // Crear un objeto FormData
    const formData = new FormData();
    formData.append("date", formattedDate);
    // Mantener el tour seleccionado si hay alguno
    if (data.selectedTourSlug) {
      formData.append("tourSlug", data.selectedTourSlug);
    }
    // Mantener el estado seleccionado
    formData.append("status", data.selectedStatus);
    // Mantener la configuración allDates si está establecida
    if (data.allDates) {
      formData.append("allDates", "true");
    }
    // Resetear a página 1 al cambiar la fecha
    formData.append("page", "1");

    // Enviar el formulario con la nueva fecha
    submit(formData, {
      method: "get",
      replace: true,
    });
  };

  const handleTourChange = (tourSlug: string) => {
    // Crear un objeto FormData
    const formData = new FormData();
    formData.append("date", data.selectedDate);
    if (tourSlug && tourSlug !== "all") {
      formData.append("tourSlug", tourSlug);
    }
    // Mantener el estado seleccionado
    formData.append("status", data.selectedStatus);
    // Mantener la configuración allDates si está establecida
    if (data.allDates) {
      formData.append("allDates", "true");
    }
    // Resetear a página 1 al cambiar el tour
    formData.append("page", "1");

    // Enviar el formulario con el nuevo tour
    submit(formData, {
      method: "get",
      replace: true,
    });
  };

  const handleStatusChange = (status: string) => {
    // Crear un objeto FormData
    const formData = new FormData();
    formData.append("date", data.selectedDate);
    // Mantener el tour seleccionado si hay alguno
    if (data.selectedTourSlug) {
      formData.append("tourSlug", data.selectedTourSlug);
    }
    formData.append("status", status);
    // Resetear allDates al cambiar el estado
    if (status === "cancelled" && data.allDates) {
      formData.append("allDates", "true");
    }
    // Resetear a página 1 al cambiar el estado
    formData.append("page", "1");

    // Enviar el formulario con el nuevo estado
    submit(formData, {
      method: "get",
      replace: true,
    });
  };
  
  const handleAllDatesChange = (allDates: boolean) => {
    // Crear un objeto FormData
    const formData = new FormData();
    formData.append("date", data.selectedDate);
    // Mantener el tour seleccionado si hay alguno
    if (data.selectedTourSlug) {
      formData.append("tourSlug", data.selectedTourSlug);
    }
    // Mantener el estado seleccionado
    formData.append("status", data.selectedStatus);
    // Establecer el parámetro allDates
    if (allDates) {
      formData.append("allDates", "true");
    }
    // Resetear a página 1 al cambiar allDates
    formData.append("page", "1");

    // Enviar el formulario con la nueva configuración allDates
    submit(formData, {
      method: "get",
      replace: true,
    });
  };
  
  const handleCancelBooking = (bookingId: string, shouldRefund: boolean, reason: string) => {
    const formData = new FormData();
    formData.append("intent", "cancelBooking");
    formData.append("bookingId", bookingId);
    formData.append("shouldRefund", shouldRefund.toString());
    formData.append("reason", reason);
    
    // Enviar el formulario y devolver una promesa que se resolverá con la respuesta del fetch
    return new Promise<{
      success: boolean;
      message: string;
      refundResult?: {
        success: boolean;
        refundId?: string;
        error?: string;
        mockResponse?: boolean;
      };
    }>(resolve => {
      // Usar fetch directamente en lugar de submit para obtener la respuesta
      fetch("/admin/dashboard/bookings", {
        method: "POST",
        body: formData,
      })
        .then(async response => {
          // Primero comprobar si la respuesta es correcta
          if (!response.ok) {
            // Intentar obtener un mensaje de error significativo
            try {
              const text = await response.text();
              
              // Intentar analizar como JSON
              try {
                const errorData = JSON.parse(text);
                return resolve({
                  success: false,
                  message: errorData.error || `Error del servidor: ${response.status}`
                });
              } catch (e) {
                // Si no es JSON, extraer un error significativo del HTML o usar el estado
                let errorMessage = `Error del servidor: ${response.status}`;
                if (text.includes('<title>')) {
                  try {
                    errorMessage = text.split('<title>')[1].split('</title>')[0];
                  } catch (htmlError) {
                    console.error("Error al extraer título del HTML:", htmlError);
                  }
                }
                return resolve({
                  success: false,
                  message: errorMessage
                });
              }
            } catch (textError) {
              // Si ni siquiera podemos obtener el texto de la respuesta
              return resolve({
                success: false,
                message: `Error del servidor: ${response.status}`
              });
            }
          }
          
          // Si la respuesta es correcta, intentar analizar como JSON
          let data;
          try {
            // Primero comprobar si la respuesta es HTML mirando los primeros caracteres
            const text = await response.text();
            if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
              // Esta es una respuesta HTML, no JSON
              
              // Comprobar si el HTML contiene indicadores de éxito
              // Por ejemplo, si los logs muestran un reembolso exitoso pero obtenemos HTML
              const containsSuccessIndicators = 
                text.includes('PayPal refund successful') || 
                text.includes('Cancellation email sent') ||
                text.includes('Booking cancelled successfully');
                
              if (containsSuccessIndicators) {
                // Si el HTML contiene indicadores de éxito, asumir que la operación fue exitosa
                console.log('La respuesta HTML contiene indicadores de éxito, tratándola como cancelación exitosa');
                
                // Refrescar los datos después de una cancelación exitosa
                refreshCurrentData();
                
                return resolve({
                  success: true,
                  message: "Reserva cancelada correctamente",
                  refundResult: {
                    success: true,
                    mockResponse: false
                  }
                });
              }
              
              // De lo contrario, tratar como un error
              let errorMessage = 'El servidor devolvió HTML en lugar de JSON';
              try {
                // Intentar extraer un error significativo del HTML
                if (text.includes('<title>')) {
                  errorMessage = text.split('<title>')[1].split('</title>')[0];
                }
              } catch (htmlError) {
                // Ignorar errores en el análisis HTML
              }
              
              return resolve({
                success: false,
                message: errorMessage
              });
            }
            
            // Si no es HTML, intentar analizar como JSON
            try {
              data = JSON.parse(text);
            } catch (parseError) {
              // Si no podemos analizar como JSON, devolver un error amigable
              return resolve({
                success: false,
                message: "El servidor devolvió un formato de respuesta inválido"
              });
            }
            
            if (data.error) {
              return resolve({
                success: false,
                message: data.error
              });
            }
            
            // Refrescar los datos después de una cancelación exitosa
            if (data.success) {
              refreshCurrentData();
            }
            
            return resolve({
              success: true,
              message: data.message || "Reserva cancelada correctamente",
              refundResult: data.refundResult
            });
          } catch (responseError) {
            // Si hay algún error al procesar la respuesta
            console.error("Error al procesar la respuesta del servidor:", responseError);
            return resolve({
              success: false,
              message: "Error al procesar la respuesta del servidor"
            });
          }
        })
        .catch(error => {
          // Manejar cualquier error de red
          console.error("Error de red durante la cancelación:", error);
          resolve({
            success: false,
            message: error instanceof Error ? error.message : "Ocurrió un error inesperado"
          });
        });
    });
  };

  // Función para refrescar los datos actuales sin cambiar la URL
  const refreshCurrentData = () => {
    // Crear un objeto FormData con los parámetros actuales
    const formData = new FormData();
    formData.append("date", data.selectedDate);
    // Mantener el tour seleccionado si hay alguno
    if (data.selectedTourSlug) {
      formData.append("tourSlug", data.selectedTourSlug);
    }
    // Mantener el estado seleccionado
    formData.append("status", data.selectedStatus);
    // Mantener la configuración allDates si está establecida
    if (data.allDates) {
      formData.append("allDates", "true");
    }
    // Mantener el término de búsqueda si hay alguno
    if (data.searchTerm) {
      formData.append("searchTerm", data.searchTerm);
    }
    // Mantener la página actual
    formData.append("page", data.pagination.currentPage.toString());

    // Enviar el formulario para refrescar los datos
    submit(formData, {
      method: "get",
      replace: true,
    });
  };

  const handleSearchChange = (searchTerm: string) => {
    // Solo activar la búsqueda si el término ha cambiado y es diferente del actual
    if (searchTerm === data.searchTerm) {
      return;
    }
    
    // Establecer estado de búsqueda
    setIsSearching(true);
    
    // Crear un objeto FormData
    const formData = new FormData();
    formData.append("date", data.selectedDate);
    // Mantener el tour seleccionado si hay alguno
    if (data.selectedTourSlug) {
      formData.append("tourSlug", data.selectedTourSlug);
    }
    // Mantener el estado seleccionado
    formData.append("status", data.selectedStatus);
    // Mantener la configuración allDates si está establecida
    if (data.allDates) {
      formData.append("allDates", "true");
    }
    // Añadir el término de búsqueda
    if (searchTerm) {
      formData.append("searchTerm", searchTerm);
    }
    // Resetear a página 1 al cambiar el término de búsqueda
    formData.append("page", "1");

    // Enviar el formulario con el nuevo término de búsqueda
    submit(formData, {
      method: "get",
      replace: true,
    });
  };

  // Resetear estado de búsqueda cuando cambian los datos (búsqueda completada)
  useEffect(() => {
    setIsSearching(false);
  }, [data]);

  return (
    <AdminBookingsFeature 
      loaderData={data} 
      onDateChange={handleDateChange} 
      onTourChange={handleTourChange}
      onStatusChange={handleStatusChange}
      onAllDatesChange={handleAllDatesChange}
      onCancelBooking={handleCancelBooking}
      onSearchChange={handleSearchChange}
      isSearching={isSearching}
      strings={strings}
    />
  );
}
