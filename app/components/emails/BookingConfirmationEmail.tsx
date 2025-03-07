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

// Extend the Booking type for email purposes
interface EmailBooking extends Booking {
  time?: string;
}

interface BookingConfirmationEmailProps {
  booking: EmailBooking;
}

export const BookingConfirmationEmail = ({ booking }: BookingConfirmationEmailProps) => {
  // Determine language - default to Spanish if not specified
  const language = booking.language || "es";
  const isEnglish = language === "en";
  
  // Text content based on language
  const texts = {
    previewText: isEnglish 
      ? `Booking confirmation for ${booking.tourName || 'Tour to Valencia'}`
      : `Confirmación de reserva para ${booking.tourName || 'Tour to Valencia'}`,
    
    heroHeading: isEnglish 
      ? "Booking Confirmed!"
      : "¡Reserva Confirmada!",
    
    greeting: isEnglish 
      ? `Dear ${booking.fullName},`
      : `Estimado/a ${booking.fullName},`,
    
    thankYouMessage: isEnglish
      ? `Thank you for booking with <strong>Tour to Valencia</strong>! We have received your booking and are pleased to confirm the following details:`
      : `¡Gracias por reservar con <strong>Tour to Valencia</strong>! Hemos recibido tu reserva y estamos encantados de confirmar los siguientes detalles:`,
    
    detailsHeading: isEnglish
      ? "Your Booking Details"
      : "Detalles de tu Reserva",
    
    labels: {
      bookingId: isEnglish ? "Booking ID:" : "ID de Reserva:",
      bookingDate: isEnglish ? "Booking Date:" : "Fecha de Reserva:",
      name: isEnglish ? "Name:" : "Nombre:",
      email: isEnglish ? "Email:" : "Email:",
      phone: isEnglish ? "Phone:" : "Teléfono:",
      tour: isEnglish ? "Tour:" : "Tour:",
      tourDate: isEnglish ? "Tour Date:" : "Fecha del Tour:",
      tourTime: isEnglish ? "Tour Time:" : "Hora del Tour:",
      people: isEnglish ? "Number of People:" : "Número de Personas:",
      totalPrice: isEnglish ? "Total Price:" : "Precio Total:",
      paymentMethod: isEnglish ? "Payment Method:" : "Método de Pago:",
    },
    
    importantInfo: isEnglish
      ? "Important Information"
      : "Información Importante",
    
    meetingPoint: isEnglish
      ? "Meeting Point"
      : "Punto de Encuentro",
    
    meetingPointDetails: isEnglish
      ? "Please arrive 15 minutes before the scheduled departure time. Our guide will be waiting for you at the designated meeting point."
      : "Por favor, llegue 15 minutos antes de la hora de salida programada. Nuestro guía le estará esperando en el punto de encuentro designado.",
    
    whatToBring: isEnglish
      ? "What to Bring"
      : "Qué Llevar",
    
    whatToBringDetails: isEnglish
      ? "Comfortable shoes, water, sunscreen, and a camera to capture the memories."
      : "Zapatos cómodos, agua, protector solar y una cámara para capturar los recuerdos.",
    
    contactUs: isEnglish
      ? "Contact Us"
      : "Contáctenos",
    
    contactUsDetails: isEnglish
      ? "If you have any questions or need to make changes to your booking, please contact us at:"
      : "Si tiene alguna pregunta o necesita hacer cambios en su reserva, contáctenos en:",
    
    footer: isEnglish
      ? "We look forward to providing you with an unforgettable experience!"
      : "¡Esperamos proporcionarle una experiencia inolvidable!",
    
    footerSignature: isEnglish
      ? "The Tour to Valencia Team"
      : "El Equipo de Tour to Valencia",
  };
  
  const bookingDate = new Date(booking.date);
  // Format date based on language
  const formattedDate = bookingDate.toLocaleDateString(isEnglish ? 'en-US' : 'es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calculate the total price
  const totalPrice = (booking.amount).toFixed(2);
  
  // Format payment method
  const paymentMethod = booking.paymentMethod 
    ? booking.paymentMethod === "paypal" 
      ? isEnglish ? "PayPal" : "PayPal" 
      : booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1)
    : isEnglish ? "Online Payment" : "Pago en línea";

  return (
    <Html>
      <Head />
      <Preview>{texts.previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src="cid:tourtovalencialogo"
              width="300"
              height="80"
              alt="Tour To Valencia"
              style={logo}
            />
          </Section>
          
          <Section style={heroSection}>
            <Heading style={heroHeading}>{texts.heroHeading}</Heading>
          </Section>
          
          <Section style={section}>
            <Text style={greeting}>
              {texts.greeting}
            </Text>
            
            <Text style={text} dangerouslySetInnerHTML={{ __html: texts.thankYouMessage }} />

            <Section style={detailsSection}>
              <Heading as="h2" style={detailsHeading}>{texts.detailsHeading}</Heading>
              
              <Section style={detailsContainer}>
                <Text style={detailItem}>
                  <Text style={detailLabel}>{texts.labels.bookingId}</Text>
                  <Text style={detailValue}>{booking.paymentIntentId || 'N/A'}</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>{texts.labels.bookingDate}</Text>
                  <Text style={detailValue}>{new Date().toLocaleDateString(isEnglish ? "en-US" : "es-ES")}</Text>
                </Text>
                
                <Hr style={dividerSmall} />
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>{texts.labels.name}</Text>
                  <Text style={detailValue}>{booking.fullName}</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>{texts.labels.email}</Text>
                  <Text style={detailValue}>{booking.email}</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>{texts.labels.phone}</Text>
                  <Text style={detailValue}>{booking.phoneNumber}</Text>
                </Text>
                
                <Hr style={dividerSmall} />
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>{texts.labels.tour}</Text>
                  <Text style={detailValue}>{booking.tourName || 'Standard Tour'}</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>{texts.labels.tourDate}</Text>
                  <Text style={detailValue}>{formattedDate}</Text>
                </Text>
                
                {booking.time && (
                  <Text style={detailItem}>
                    <Text style={detailLabel}>{texts.labels.tourTime}</Text>
                    <Text style={detailValue}>{booking.time}</Text>
                  </Text>
                )}
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>{texts.labels.people}</Text>
                  <Text style={detailValue}>{booking.partySize}</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>{texts.labels.totalPrice}</Text>
                  <Text style={detailValuePrice}>{totalPrice}€</Text>
                </Text>
                
                <Text style={detailItem}>
                  <Text style={detailLabel}>{texts.labels.paymentMethod}</Text>
                  <Text style={detailValue}>{paymentMethod}</Text>
                </Text>
              </Section>
            </Section>
            
            <Section style={infoSection}>
              <Heading as="h2" style={infoHeading}>{texts.importantInfo}</Heading>
              
              <Section style={infoContainer}>
                <Text style={infoTitle}>{texts.meetingPoint}</Text>
                <Text style={infoContent}>{texts.meetingPointDetails}</Text>
                
                <Text style={infoTitle}>{texts.whatToBring}</Text>
                <Text style={infoContent}>{texts.whatToBringDetails}</Text>
                
                <Text style={infoTitle}>{texts.contactUs}</Text>
                <Text style={infoContent}>
                  {texts.contactUsDetails}
                  <br />
                  <Link href="mailto:tourtovalencia@gmail.com" style={link}>
                    tourtovalencia@gmail.com
                  </Link>
                  <br />
                  <Link href="tel:+34625291391" style={link}>
                    +34 625 291 391
                  </Link>
                </Text>
              </Section>
            </Section>
            
            <Hr style={divider} />
            
            <Text style={footer}>
              {texts.footer}
              <br />
              <br />
              {texts.footerSignature}
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Tour to Valencia. Todos los derechos reservados.
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

const detailValuePrice = {
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

const infoContainer = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  border: "1px solid #eaeaea",
};

const infoTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
  margin: "16px 0 8px 0",
  textAlign: "center" as const,
};

const infoContent = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#4a4a4a",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const divider = {
  borderTop: "1px solid #eaeaea",
  margin: "32px 0",
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
  margin: "0",
};
