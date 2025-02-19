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
import type { BookingDocument } from "~/services/booking.server";

interface EmailProps {
  booking: BookingDocument;
}

export const BookingAdminEmail = ({ booking }: EmailProps) => {
  const previewText = `New booking from ${booking.fullName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Booking Received</Heading>
          <Section style={section}>
            <Text style={text}>
              A new booking has been received with the following details:
            </Text>

            <Row style={details}>
              <Column>
                <Text style={label}>Name:</Text>
                <Text style={label}>Email:</Text>
                <Text style={label}>Phone:</Text>
                <Text style={label}>Date:</Text>
                <Text style={label}>Party Size:</Text>
                <Text style={label}>Total Amount:</Text>
                <Text style={label}>Payment Status:</Text>
                <Text style={label}>Booking Status:</Text>
              </Column>
              <Column>
                <Text style={value}>{booking.fullName}</Text>
                <Text style={value}>{booking.email}</Text>
                <Text style={value}>{booking.phone}</Text>
                <Text style={value}>{format(booking.date, "PPP")}</Text>
                <Text style={value}>{booking.partySize} people</Text>
                <Text style={value}>€{booking.totalAmount}</Text>
                <Text style={value}>{booking.paymentStatus}</Text>
                <Text style={value}>{booking.status}</Text>
              </Column>
            </Row>
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
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const details = {
  margin: "20px 0",
};

const label = {
  ...text,
  fontWeight: "bold",
  margin: "8px 0",
};

const value = {
  ...text,
  margin: "8px 0",
};