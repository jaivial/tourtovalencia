import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Booking } from "~/types/booking";

interface BookingConfirmationEmailProps {
  booking: Booking;
}

export const BookingConfirmationEmail = ({ booking }: BookingConfirmationEmailProps) => {
  const previewText = `Confirmación de reserva para ${booking.tourName || 'la Excursión a Medina Azahara'}`;
  const bookingDate = new Date(booking.date);

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Confirmación de Reserva</Heading>
          
          <Section style={section}>
            <Text style={text}>
              Estimado/a {booking.fullName},
            </Text>
            
            <Text style={text}>
              ¡Gracias por reservar tu excursión{booking.tourName ? ` a ${booking.tourName}` : ' a Medina Azahara'}! A continuación encontrarás los detalles de tu reserva:
            </Text>

            <Section style={detailsSection}>
              {booking.tourName && (
                <Text style={detailText}>
                  <strong>Tour:</strong> {booking.tourName}
                </Text>
              )}
              <Text style={detailText}>
                <strong>Fecha:</strong> {bookingDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
              <Text style={detailText}>
                <strong>Hora:</strong> {bookingDate.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              <Text style={detailText}>
                <strong>Número de personas:</strong> {booking.partySize}
              </Text>
              <Text style={detailText}>
                <strong>Total pagado:</strong> €{(booking.amount / 100).toFixed(2)}
              </Text>
            </Section>

            <Text style={text}>
              Por favor, preséntate en el punto de encuentro 10 minutos antes de la hora indicada.
            </Text>

            <Text style={text}>
              Si tienes alguna pregunta o necesitas hacer cambios en tu reserva, no dudes en contactarnos.
            </Text>

            <Text style={text}>
              ¡Esperamos verte pronto!
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const section = {
  padding: "0 48px",
};

const detailsSection = {
  padding: "24px",
  backgroundColor: "#f6f9fc",
  borderRadius: "4px",
  margin: "16px 0",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const detailText = {
  ...text,
  margin: "8px 0",
};
