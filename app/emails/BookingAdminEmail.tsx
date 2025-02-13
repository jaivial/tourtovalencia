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

export const BookingAdminEmail = ({ booking, totalPrice }: EmailProps) => {
  const previewText = `New booking request from ${booking.fullName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container>
          <Section>
            <Heading style={styles.heading}>New Booking Request</Heading>
            <Text style={styles.text}>
              You have received a new booking request with the following details:
            </Text>
          </Section>

          <Section style={styles.details}>
            <Row>
              <Column>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.label}>Party Size:</Text>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.label}>Total Price:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>{booking.fullName}</Text>
                <Text style={styles.value}>{booking.email}</Text>
                <Text style={styles.value}>{booking.phone}</Text>
                <Text style={styles.value}>{booking.partySize} people</Text>
                <Text style={styles.value}>
                  {booking.bookingDate
                    ? format(booking.bookingDate, "PPP")
                    : "Not selected"}
                </Text>
                <Text style={styles.value}>€{totalPrice}</Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  main: {
    backgroundColor: "#ffffff",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "24px",
  },
  text: {
    fontSize: "16px",
    lineHeight: "24px",
    marginBottom: "24px",
  },
  details: {
    backgroundColor: "#f9fafb",
    padding: "24px",
    borderRadius: "8px",
  },
  label: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "8px",
  },
  value: {
    fontSize: "16px",
    marginBottom: "8px",
  },
};

export default BookingAdminEmail; 