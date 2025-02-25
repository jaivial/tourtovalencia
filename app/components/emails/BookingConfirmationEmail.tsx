import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
  Img,
} from "@react-email/components";
import { Booking } from "~/types/booking";

interface BookingConfirmationEmailProps {
  booking: Booking;
}

export const BookingConfirmationEmail = ({ booking }: BookingConfirmationEmailProps) => {
  const previewText = `Confirmación de reserva para ${booking.tourName || 'Excursiones Mediterráneo'}`;
  const bookingDate = new Date(booking.date);
  const formattedDate = bookingDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calculate the total price
  const totalPrice = (booking.amount).toFixed(2);

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src="https://via.placeholder.com/200x80?text=Excursiones+Mediterraneo"
              width="200"
              height="80"
              alt="Excursiones Mediterráneo"
              style={logo}
            />
          </Section>
          
          <Section style={heroSection}>
            <Heading style={heroHeading}>¡Reserva Confirmada!</Heading>
          </Section>
          
          <Section style={section}>
            <Text style={greeting}>
              Estimado/a <strong>{booking.fullName}</strong>,
            </Text>
            
            <Text style={text}>
              ¡Gracias por reservar con <strong>Excursiones Mediterráneo</strong>! Hemos recibido tu reserva y estamos encantados de confirmar los siguientes detalles:
            </Text>

            <Section style={detailsSection}>
              <Heading as="h2" style={detailsHeading}>Detalles de tu Reserva</Heading>
              
              <Section style={detailsContainer}>
                <Text style={detailItem}>
                  <Text style={detailLabel}>ID de Reserva:</Text>
                  <Text style={detailValue}>{booking.paymentIntentId || 'N/A'}</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Fecha de Reserva:</Text>
                  <Text style={detailValue}>{new Date().toLocaleDateString("es-ES")}</Text>
                </Text>
                
                <Hr style={dividerSmall} />
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Nombre:</Text>
                  <Text style={detailValue}>{booking.fullName}</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Email:</Text>
                  <Text style={detailValue}>{booking.email}</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Teléfono:</Text>
                  <Text style={detailValue}>{booking.phoneNumber}</Text>
                </Text>
                
                <Hr style={dividerSmall} />
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Tour:</Text>
                  <Text style={detailValue}>{booking.tourName || 'Excursiones Mediterráneo'}</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Fecha del Tour:</Text>
                  <Text style={detailValue}>{formattedDate}</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Personas:</Text>
                  <Text style={detailValue}>{booking.partySize}</Text>
                </Text>
                
                <Hr style={dividerSmall} />
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Total Pagado:</Text>
                  <Text style={detailValueHighlight}>€{totalPrice}</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Estado de Pago:</Text>
                  <Text style={detailValueHighlight}>✓ Confirmado</Text>
                </Text>
              </Section>
            </Section>

            <Section style={infoSection}>
              <Heading as="h3" style={infoHeading}>Información Importante</Heading>
              
              <Text style={text}>
                • Por favor, preséntate en el punto de encuentro <strong>10 minutos antes</strong> de la hora de inicio del tour.
              </Text>
              
              <Text style={text}>
                • Recuerda llevar ropa y calzado cómodos, así como protección solar si es necesario.
              </Text>
              
              <Text style={text}>
                • Si necesitas hacer algún cambio en tu reserva, contáctanos lo antes posible.
              </Text>
            </Section>

            <Hr style={divider} />

            <Text style={text}>
              Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos:
            </Text>
            
            <Text style={contactInfo}>
              📧 Email: <Link href="mailto:info@excursionesmediterraneo.com" style={link}>info@excursionesmediterraneo.com</Link>
            </Text>
            
            <Text style={contactInfo}>
              📱 Teléfono: <Link href="tel:+34600000000" style={link}>+34 600 000 000</Link>
            </Text>

            <Text style={thankYou}>
              ¡Esperamos verte pronto y que disfrutes de tu experiencia con nosotros!
            </Text>
            
            <Text style={signature}>
              El equipo de Excursiones Mediterráneo
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Excursiones Mediterráneo. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f5f7fa",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: "20px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  borderRadius: "8px",
  overflow: "hidden",
  maxWidth: "600px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
};

const logoSection = {
  padding: "24px 0",
  textAlign: "center" as const,
  backgroundColor: "#ffffff",
};

const logo = {
  margin: "0 auto",
};

const heroSection = {
  backgroundColor: "#0056b3",
  padding: "32px 24px",
  textAlign: "center" as const,
};

const heroHeading = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const section = {
  padding: "32px 24px",
  textAlign: "center" as const,
};

const greeting = {
  fontSize: "18px",
  lineHeight: "26px",
  color: "#333",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4a4a4a",
  margin: "16px 0",
  textAlign: "center" as const,
};

const detailsSection = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #eaeaea",
};

const detailsHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#333",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const detailsContainer = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: "16px",
};

const detailItem = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  margin: "8px 0",
  width: "100%",
};

const detailLabel = {
  fontSize: "14px",
  color: "#666",
  fontWeight: "bold",
  margin: "4px 0",
  textAlign: "center" as const,
};

const detailValue = {
  fontSize: "16px",
  color: "#333",
  margin: "4px 0",
  textAlign: "center" as const,
};

const detailValueHighlight = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#0056b3",
  margin: "4px 0",
  textAlign: "center" as const,
};

const dividerSmall = {
  borderTop: "1px dashed #eaeaea",
  margin: "16px 0",
  width: "100%",
};

const infoSection = {
  margin: "24px 0",
};

const infoHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#333",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const divider = {
  borderTop: "1px solid #eaeaea",
  margin: "32px 0",
};

const contactInfo = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#4a4a4a",
  margin: "8px 0",
  textAlign: "center" as const,
};

const link = {
  color: "#0056b3",
  textDecoration: "none",
};

const thankYou = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333",
  margin: "32px 0 16px 0",
  fontWeight: "bold",
  textAlign: "center" as const,
};

const signature = {
  fontSize: "16px",
  color: "#666",
  fontStyle: "italic",
  margin: "16px 0 0 0",
  textAlign: "center" as const,
};

const footer = {
  backgroundColor: "#f5f7fa",
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "14px",
  color: "#999",
  margin: "0",
};
