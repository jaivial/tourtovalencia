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
  const previewText = `Confirmación de reserva para la Excursión a Medina Azahara`;

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
              ¡Gracias por reservar tu excursión a Medina Azahara! A continuación encontrarás los detalles de tu reserva:
            </Text>

            <Section style={detailsSection}>
              <Text style={detailText}>
                <strong>Fecha:</strong> {new Date(booking.bookingDate).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
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
              Punto de encuentro: Parada de autobús frente al Centro de Recepción de Visitantes de Medina Azahara.
            </Text>

            <Text style={text}>
              Por favor, llegue 10 minutos antes de la hora programada. Si necesita cancelar o modificar su reserva, contáctenos lo antes posible.
            </Text>

            <Text style={text}>
              Para cualquier consulta, no dude en contactarnos en excursionesmed@gmail.com
            </Text>

            <Text style={text}>
              ¡Esperamos verle pronto!
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

const detailsSection = {
  backgroundColor: "#f6f9fc",
  borderRadius: "4px",
  padding: "24px",
  margin: "24px 0",
};

const detailText = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "8px 0",
};
