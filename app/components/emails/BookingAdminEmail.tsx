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

interface BookingAdminEmailProps {
  booking: Booking;
}

export const BookingAdminEmail = ({ booking }: BookingAdminEmailProps) => {
  const previewText = `Nueva reserva recibida de ${booking.fullName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Nueva Reserva - Viajes Olga</Heading>
          
          <Section style={section}>
            <Heading as="h2" style={h2}>
              Detalles de la Reserva:
            </Heading>
            
            <Text style={text}>
              <strong>Nombre:</strong> {booking.fullName}
            </Text>
            <Text style={text}>
              <strong>Email:</strong> {booking.email}
            </Text>
            {booking.tourName && (
              <Text style={text}>
                <strong>Tour:</strong> {booking.tourName}
              </Text>
            )}
            <Text style={text}>
              <strong>Fecha:</strong>{" "}
              {new Date(booking.date).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={text}>
              <strong>Número de Personas:</strong> {booking.partySize}
            </Text>
            <Text style={text}>
              <strong>Total Pagado:</strong> €{(booking.amount / 100).toFixed(2)}
            </Text>
            <Text style={text}>
              <strong>ID de Pago:</strong> {booking.paymentIntentId}
            </Text>
            <Text style={text}>
              <strong>Teléfono:</strong> {booking.phoneNumber}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
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

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "24px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  margin: "12px 0",
  padding: "0",
  lineHeight: "1.5",
};
