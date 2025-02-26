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
  Button,
} from "@react-email/components";
import type { Booking } from "~/types/booking";

interface BookingCancellationEmailProps {
  booking: Booking & { _id?: string | { toString(): string } };
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
  const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bookingId = typeof booking._id === 'object' && booking._id !== null 
    ? booking._id.toString() 
    : String(booking._id || '');

  const amount = typeof booking.amount === 'number' 
    ? booking.amount.toFixed(2) 
    : '';

  const customerName = String(booking.fullName || '');

  const tourType = String(booking.tourName || 'Tour');

  const partySize = Number(booking.partySize || 0);

  return (
    <Html>
      <Head />
      <Preview>Your booking has been cancelled</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Img
            src="https://viajesolga.com/logo.png"
            alt="Viajes Olga Logo"
            width={150}
            height="auto"
            style={styles.logo}
          />
          
          <Section style={styles.section}>
            <Heading style={styles.heading}>Booking Cancellation</Heading>
            <Text style={styles.text}>
              Dear {customerName},
            </Text>
            <Text style={styles.text}>
              We&apos;re writing to confirm that your booking has been cancelled as requested.
            </Text>
            
            <Section style={styles.bookingDetails}>
              <Heading as="h2" style={styles.subheading}>
                Booking Details
              </Heading>
              <Text style={styles.detailItem}>
                <strong>Booking Reference:</strong> {bookingId}
              </Text>
              <Text style={styles.detailItem}>
                <strong>Tour:</strong> {tourType}
              </Text>
              <Text style={styles.detailItem}>
                <strong>Date:</strong> {formattedDate}
              </Text>
              <Text style={styles.detailItem}>
                <strong>Number of People:</strong> {partySize}
              </Text>
              {amount && (
                <Text style={styles.detailItem}>
                  <strong>Amount:</strong> €{amount}
                </Text>
              )}
            </Section>
            
            <Section style={styles.cancellationDetails}>
              <Heading as="h2" style={styles.subheading}>
                Cancellation Details
              </Heading>
              <Text style={styles.detailItem}>
                <strong>Reason:</strong> {reason}
              </Text>
              {refundIssued && (
                <>
                  <Text style={styles.detailItem}>
                    <strong>Refund Status:</strong> A refund has been processed
                  </Text>
                  {refundId && (
                    <Text style={styles.detailItem}>
                      <strong>Refund Reference:</strong> {refundId}
                    </Text>
                  )}
                  <Text style={styles.text}>
                    Please allow 5-10 business days for the refund to appear in your account.
                  </Text>
                </>
              )}
            </Section>
            
            <Text style={styles.text}>
              If you have any questions or need further assistance, please don&apos;t hesitate to contact us.
            </Text>
            
            <Section style={styles.ctaContainer}>
              <Button
                href="https://viajesolga.com/contact"
                style={styles.button}
              >
                Contact Us
              </Button>
            </Section>
          </Section>
          
          <Hr style={styles.hr} />
          
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              &copy; {new Date().getFullYear()} Viajes Olga. All rights reserved.
            </Text>
            <Text style={styles.footerText}>
              <Link href="https://viajesolga.com" style={styles.link}>
                viajesolga.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0",
    maxWidth: "600px",
  },
  logo: {
    margin: "0 auto 20px",
    display: "block",
  },
  section: {
    padding: "0 24px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
    color: "#333",
  },
  subheading: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "25px 0 15px",
    color: "#333",
    borderBottom: "1px solid #eee",
    paddingBottom: "8px",
  },
  text: {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#404040",
    margin: "16px 0",
  },
  bookingDetails: {
    backgroundColor: "#f9f9f9",
    borderRadius: "5px",
    padding: "15px",
    margin: "20px 0",
  },
  cancellationDetails: {
    backgroundColor: "#fff0f0",
    borderRadius: "5px",
    padding: "15px",
    margin: "20px 0",
    border: "1px solid #ffcccc",
  },
  detailItem: {
    fontSize: "15px",
    lineHeight: "24px",
    margin: "10px 0",
    color: "#404040",
  },
  ctaContainer: {
    textAlign: "center" as const,
    margin: "30px 0",
  },
  button: {
    backgroundColor: "#4a7dbd",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 20px",
  },
  hr: {
    borderColor: "#e6ebf1",
    margin: "20px 0",
  },
  footer: {
    textAlign: "center" as const,
    padding: "0 24px",
  },
  footerText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "8px 0",
  },
  link: {
    color: "#4a7dbd",
    textDecoration: "underline",
  },
}; 