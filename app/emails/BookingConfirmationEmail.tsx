import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import { format } from "date-fns";
import type { BookingFormData } from "~/hooks/book.hooks";

interface EmailProps {
  booking: BookingFormData;
  totalPrice: number;
}

export const BookingConfirmationEmail = ({ booking, totalPrice }: EmailProps) => {
  const previewText = `Booking request received for ${booking.fullName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Request Received</Heading>
          
          <Section style={section}>
            <Text style={text}>Dear {booking.fullName},</Text>
            <Text style={text}>
              Thank you for your booking request. Here's a summary of your details:
            </Text>
          </Section>

          <Section style={detailsSection}>
            <Heading as="h2" style={h2}>Personal Details</Heading>
            <Row>
              <Column>
                <Text style={label}>Name:</Text>
                <Text style={label}>Email:</Text>
                <Text style={label}>Phone:</Text>
              </Column>
              <Column>
                <Text style={value}>{booking.fullName}</Text>
                <Text style={value}>{booking.email}</Text>
                <Text style={value}>{booking.phone}</Text>
              </Column>
            </Row>

            <Heading as="h2" style={h2}>Booking Details</Heading>
            <Row>
              <Column>
                <Text style={label}>Party Size:</Text>
                <Text style={label}>Date:</Text>
                <Text style={label}>Total Price:</Text>
              </Column>
              <Column>
                <Text style={value}>{booking.partySize} people</Text>
                <Text style={value}>
                  {booking.bookingDate
                    ? format(booking.bookingDate, "PPP")
                    : "Not selected"}
                </Text>
                <Text style={value}>€{totalPrice}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={warningSection}>
            <Text style={warningText}>
              ⚠️ Important: Your booking is not yet confirmed. Please wait for our
              confirmation via WhatsApp or email before making any arrangements.
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
  padding: "40px 20px",
  maxWidth: "600px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "0 0 20px",
};

const h2 = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "30px 0 10px",
};

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 10px",
};

const section = {
  margin: "0 0 30px",
};

const detailsSection = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "8px",
  margin: "0 0 30px",
};

const label = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0 0 5px",
};

const value = {
  color: "#1a1a1a",
  fontSize: "14px",
  margin: "0 0 10px",
};

const warningSection = {
  backgroundColor: "#fff3cd",
  padding: "20px",
  borderRadius: "8px",
  margin: "30px 0 0",
};

const warningText = {
  color: "#856404",
  fontSize: "14px",
  margin: "0",
  textAlign: "center" as const,
}; 