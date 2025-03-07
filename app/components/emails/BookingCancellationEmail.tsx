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
import type { Booking } from "~/types/booking";

// Define a type for MongoDB document with _id that could be an object
interface BookingDocument extends Omit<Booking, '_id'> {
  _id?: string | { toString(): string };
}

interface BookingCancellationEmailProps {
  booking: BookingDocument;
  reason: string;
  refundIssued: boolean;
  refundId?: string;
}

export const BookingCancellationEmail = ({
  booking,
  reason,
  refundIssued,
  refundId,
}: BookingCancellationEmailProps) => {
  // Determine language - default to Spanish if not specified
  const language = booking.language || "es";
  const isEnglish = language === "en";
  
  // Text content based on language
  const texts = {
    previewText: isEnglish 
      ? "Your booking has been cancelled"
      : "Tu reserva ha sido cancelada",
    
    title: isEnglish 
      ? "Booking Cancellation"
      : "Cancelación de Reserva",
    
    greeting: isEnglish 
      ? `Dear ${booking.fullName},`
      : `Estimado/a ${booking.fullName},`,
    
    cancellationMessage: isEnglish
      ? "We regret to inform you that your booking has been cancelled."
      : "Lamentamos informarte que tu reserva ha sido cancelada.",
    
    detailsHeading: isEnglish
      ? "Cancellation Details"
      : "Detalles de la Cancelación",
    
    labels: {
      bookingId: isEnglish ? "Booking ID:" : "ID de Reserva:",
      tour: isEnglish ? "Tour:" : "Tour:",
      tourDate: isEnglish ? "Tour Date:" : "Fecha del Tour:",
      people: isEnglish ? "Number of People:" : "Número de Personas:",
      amount: isEnglish ? "Amount:" : "Importe:",
      reason: isEnglish ? "Reason for Cancellation:" : "Motivo de Cancelación:",
      refundStatus: isEnglish ? "Refund Status:" : "Estado del Reembolso:",
    },
    
    refundIssued: isEnglish
      ? "A refund has been processed for this booking."
      : "Se ha procesado un reembolso para esta reserva.",
    
    refundNotIssued: isEnglish
      ? "No refund has been issued for this booking."
      : "No se ha emitido ningún reembolso para esta reserva.",
    
    refundId: isEnglish
      ? "Refund ID:"
      : "ID de Reembolso:",
    
    contactUs: isEnglish
      ? "If you have any questions about this cancellation, please contact us at:"
      : "Si tienes alguna pregunta sobre esta cancelación, por favor contáctanos en:",
    
    footer: isEnglish
      ? "We hope to welcome you on another tour in the future."
      : "Esperamos darte la bienvenida en otro tour en el futuro.",
    
    footerSignature: isEnglish
      ? "The Tour to Valencia Team"
      : "El Equipo de Tour to Valencia",
  };

  const formattedDate = new Date(booking.date).toLocaleDateString(isEnglish ? "en-US" : "es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Safely convert _id to string
  let bookingId = '';
  if (booking._id) {
    bookingId = typeof booking._id === 'string' 
      ? booking._id 
      : booking._id.toString();
  }

  const amount = typeof booking.amount === 'number' 
    ? booking.amount.toFixed(2) 
    : '';

  const tourType = String(booking.tourName || 'Tour');

  const partySize = Number(booking.partySize || 0);

  return (
    <Html>
      <Head />
      <Preview>{texts.previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img
              src="cid:tourtovalencialogo"
              width="300"
              height="80"
              alt="Tour To Valencia"
              style={styles.logo}
            />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.title}>{texts.title}</Heading>
            
            <Text style={styles.text}>{texts.greeting}</Text>
            
            <Text style={styles.text}>{texts.cancellationMessage}</Text>
            
            <Section style={styles.detailsContainer}>
              <Heading as="h2" style={styles.detailsHeading}>
                {texts.detailsHeading}
              </Heading>
              
              <Section style={styles.details}>
                <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{texts.labels.bookingId}</Text>
                  <Text style={styles.detailValue}>{bookingId}</Text>
                </Text>
                
                <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{texts.labels.tour}</Text>
                  <Text style={styles.detailValue}>{tourType}</Text>
                </Text>
                
                <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{texts.labels.tourDate}</Text>
                  <Text style={styles.detailValue}>{formattedDate}</Text>
                </Text>
                
                <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{texts.labels.people}</Text>
                  <Text style={styles.detailValue}>{partySize}</Text>
                </Text>
                
                {amount && (
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{texts.labels.amount}</Text>
                    <Text style={styles.detailValue}>{amount}€</Text>
                  </Text>
                )}
                
                <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{texts.labels.reason}</Text>
                  <Text style={styles.detailValue}>{reason}</Text>
                </Text>
                
                <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{texts.labels.refundStatus}</Text>
                  <Text style={styles.detailValue}>
                    {refundIssued ? (
                      <Text style={styles.refundIssued}>{texts.refundIssued}</Text>
                    ) : (
                      <Text style={styles.refundNotIssued}>{texts.refundNotIssued}</Text>
                    )}
                  </Text>
                </Text>
                
                {refundIssued && refundId && (
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{texts.refundId}</Text>
                    <Text style={styles.detailValue}>{refundId}</Text>
                  </Text>
                )}
              </Section>
            </Section>
            
            <Hr style={styles.divider} />
            
            <Text style={styles.text}>{texts.contactUs}</Text>
            
            <Text style={styles.contactInfo}>
              <Link href="mailto:tourtovalencia@gmail.com" style={styles.link}>
                tourtovalencia@gmail.com
              </Link>
            </Text>
            
            <Text style={styles.contactInfo}>
              <Link href="tel:+34625291391" style={styles.link}>
                +34 625 291 391
              </Link>
            </Text>
            
            <Text style={styles.footer}>
              {texts.footer}
              <br />
              <br />
              {texts.footerSignature}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: "#f5f5f5",
    fontFamily: "Arial, sans-serif",
    padding: "20px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "600px",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  header: {
    backgroundColor: "#f8f9fa",
    padding: "20px 0",
    textAlign: "center" as const,
    borderBottom: "1px solid #eaeaea",
  },
  logo: {
    margin: "0 auto",
  },
  content: {
    padding: "30px 40px",
  },
  title: {
    fontSize: "24px",
    color: "#e53e3e",
    margin: "0 0 20px",
    textAlign: "center" as const,
  },
  text: {
    fontSize: "16px",
    lineHeight: "24px",
    color: "#555555",
    margin: "0 0 20px",
  },
  detailsContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #eaeaea",
    margin: "30px 0",
  },
  detailsHeading: {
    backgroundColor: "#e53e3e",
    color: "#ffffff",
    fontSize: "18px",
    padding: "15px 20px",
    margin: "0",
  },
  details: {
    padding: "20px",
  },
  detailRow: {
    display: "flex",
    margin: "0 0 10px",
    fontSize: "15px",
    lineHeight: "22px",
  },
  detailLabel: {
    width: "180px",
    color: "#666666",
    fontWeight: "bold",
  },
  detailValue: {
    flex: "1",
    color: "#333333",
  },
  refundIssued: {
    color: "#38a169",
  },
  refundNotIssued: {
    color: "#e53e3e",
  },
  divider: {
    borderTop: "1px solid #eaeaea",
    margin: "20px 0",
  },
  contactInfo: {
    fontSize: "15px",
    lineHeight: "22px",
    color: "#555555",
    margin: "0 0 10px",
  },
  link: {
    color: "#3182ce",
    textDecoration: "none",
  },
  footer: {
    fontSize: "15px",
    lineHeight: "22px",
    color: "#777777",
    textAlign: "center" as const,
    margin: "30px 0 0",
  },
}; 