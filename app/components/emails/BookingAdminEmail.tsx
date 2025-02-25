import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
  Img,
} from "@react-email/components";
import { Booking } from "~/types/booking";

interface BookingAdminEmailProps {
  booking: Booking;
}

export const BookingAdminEmail = ({ booking }: BookingAdminEmailProps) => {
  const previewText = `Nueva reserva recibida de ${booking.fullName}`;
  const bookingDate = new Date(booking.date);
  const formattedDate = bookingDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
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
          
          <Section style={alertSection}>
            <Heading style={alertHeading}>¡Nueva Reserva Recibida!</Heading>
          </Section>
          
          <Section style={section}>
            <Text style={text}>
              Se ha recibido una nueva reserva con los siguientes detalles:
            </Text>
            
            <Section style={detailsSection}>
              <Heading as="h2" style={detailsHeading}>Detalles de la Reserva</Heading>
              
              <Section style={detailsGrid}>
                <Text style={detailLabel}>ID de Reserva:</Text>
                <Text style={detailValue}>{booking.paymentIntentId || 'N/A'}</Text>
                
                <Text style={detailLabel}>Fecha de Reserva:</Text>
                <Text style={detailValue}>{new Date().toLocaleDateString("es-ES")}</Text>
                
                <Hr style={dividerSmall} />
                
                <Text style={detailLabel}>Nombre:</Text>
                <Text style={detailValue}>{booking.fullName}</Text>
                
                <Text style={detailLabel}>Email:</Text>
                <Text style={detailValue}>
                  <Link href={`mailto:${booking.email}`} style={link}>{booking.email}</Link>
                </Text>
                
                <Text style={detailLabel}>Teléfono:</Text>
                <Text style={detailValue}>
                  <Link href={`tel:${booking.phoneNumber}`} style={link}>{booking.phoneNumber}</Link>
                </Text>
                
                <Hr style={dividerSmall} />
                
                <Text style={detailLabel}>Tour:</Text>
                <Text style={detailValue}>{booking.tourName || 'Excursiones Mediterráneo'}</Text>
                
                <Text style={detailLabel}>Fecha del Tour:</Text>
                <Text style={detailValue}>{formattedDate}</Text>
                
                <Text style={detailLabel}>Personas:</Text>
                <Text style={detailValue}>{booking.partySize}</Text>
                
                <Hr style={dividerSmall} />
                
                <Text style={detailLabel}>Total Pagado:</Text>
                <Text style={detailValueHighlight}>€{totalPrice}</Text>
                
                <Text style={detailLabel}>Estado de Pago:</Text>
                <Text style={detailValueSuccess}>✓ Pagado</Text>
                
                <Text style={detailLabel}>ID de Pago:</Text>
                <Text style={detailValue}>{booking.paymentIntentId}</Text>
              </Section>
            </Section>
            
            <Section style={actionSection}>
              <Text style={actionText}>
                Recuerda contactar al cliente para confirmar los detalles y proporcionar información adicional sobre el punto de encuentro.
              </Text>
              
              <Link href={`mailto:${booking.email}`} style={actionButton}>
                Contactar al Cliente
              </Link>
            </Section>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Excursiones Mediterráneo. Todos los derechos reservados.
            </Text>
            <Text style={footerText}>
              Este es un email automático, por favor no responda a este mensaje.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
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

const alertSection = {
  backgroundColor: "#2e7d32", // Green color for admin alerts
  padding: "24px",
  textAlign: "center" as const,
};

const alertHeading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const section = {
  padding: "32px 24px",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4a4a4a",
  margin: "16px 0",
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

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr",
  gap: "8px 16px",
};

const detailLabel = {
  fontSize: "14px",
  color: "#666",
  fontWeight: "bold",
  margin: "8px 0",
};

const detailValue = {
  fontSize: "14px",
  color: "#333",
  margin: "8px 0",
};

const detailValueHighlight = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#0056b3",
  margin: "8px 0",
};

const detailValueSuccess = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#2e7d32",
  margin: "8px 0",
};

const dividerSmall = {
  borderTop: "1px dashed #eaeaea",
  margin: "8px 0",
  gridColumn: "1 / span 2",
};

const actionSection = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const actionText = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4a4a4a",
  margin: "0 0 24px 0",
};

const actionButton = {
  backgroundColor: "#0056b3",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "4px",
  textDecoration: "none",
  fontWeight: "bold",
  display: "inline-block",
};

const link = {
  color: "#0056b3",
  textDecoration: "none",
};

const footer = {
  backgroundColor: "#f5f7fa",
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "14px",
  color: "#999",
  margin: "4px 0",
};
