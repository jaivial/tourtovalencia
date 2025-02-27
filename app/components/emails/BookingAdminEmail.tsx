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

// Define a more flexible booking type for the email component
interface EmailBooking {
  _id?: string | { toString(): string };
  fullName: string;
  email: string;
  date: string | Date;
  partySize: number;
  amount: number;
  paymentIntentId: string;
  phoneNumber: string;
  tourName?: string;
  language?: string;
  paymentMethod?: string;
  country?: string;
  countryCode?: string;
}

interface BookingAdminEmailProps {
  booking: EmailBooking;
}

export const BookingAdminEmail = ({ booking }: BookingAdminEmailProps) => {
  // Get the customer's language for display purposes only
  const customerLanguage = booking.language || "es";
  const customerLanguageDisplay = customerLanguage === "en" ? "Inglés" : "Español";
  
  // Format the booking date in Spanish
  const bookingDate = new Date(booking.date);
  const formattedDate = bookingDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  // Calculate the total price
  const totalPrice = (booking.amount).toFixed(2);
  
  // Format payment method
  const paymentMethod = booking.paymentMethod === "paypal" 
    ? "PayPal" 
    : booking.paymentMethod 
      ? booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1) 
      : "Pago en línea";

  const previewText = `Nueva reserva recibida de ${booking.fullName}`;

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
                  <Text style={detailValue}>
                    <Link href={`mailto:${booking.email}`} style={link}>{booking.email}</Link>
                  </Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Teléfono:</Text>
                  <Text style={detailValue}>{booking.phoneNumber || 'No proporcionado'}</Text>
                </Text>
                
                {booking.country && booking.countryCode && (
                  <Text style={detailItem}>
                    <Text style={detailLabel}>País:</Text>
                    <Text style={detailValue}>
                      {booking.country} ({booking.countryCode})
                    </Text>
                  </Text>
                )}
                
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
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Idioma:</Text>
                  <Text style={detailValue}>{customerLanguageDisplay}</Text>
                </Text>
                
                <Hr style={dividerSmall} />
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Total Pagado:</Text>
                  <Text style={detailValueHighlight}>{totalPrice}€</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Estado de Pago:</Text>
                  <Text style={detailValueSuccess}>✓ Pagado</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>Método de Pago:</Text>
                  <Text style={detailValue}>{paymentMethod}</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>ID de Pago:</Text>
                  <Text style={detailValue}>{booking.paymentIntentId}</Text>
                </Text>
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

const detailValueSuccess = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#2e7d32",
  margin: "4px 0",
  textAlign: "center" as const,
};

const dividerSmall = {
  borderTop: "1px dashed #eaeaea",
  margin: "16px 0",
  width: "100%",
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
  textAlign: "center" as const,
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
