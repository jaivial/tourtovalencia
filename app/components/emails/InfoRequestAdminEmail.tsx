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
} from "@react-email/components";

interface InfoRequestAdminEmailProps {
  fullName: string;
  email: string;
  phoneNumber: string;
  countryCode?: string;
  tourName: string;
  tourSlug: string;
  language: "es" | "en";
}

export const InfoRequestAdminEmail = ({
  fullName,
  email,
  phoneNumber,
  countryCode,
  tourName,
  tourSlug,
  language,
}: InfoRequestAdminEmailProps) => {
  const preview = `Nueva solicitud de información para ${tourName || tourSlug}`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Nueva solicitud de información</Heading>

          <Section style={section}>
            <Text style={paragraph}>Se ha recibido una nueva solicitud para un tour sin precio.</Text>
            <Hr style={divider} />

            <Text style={label}>Tour</Text>
            <Text style={value}>{tourName || tourSlug || "Sin tour"}</Text>

            <Text style={label}>Slug</Text>
            <Text style={value}>{tourSlug || "Sin slug"}</Text>

            <Text style={label}>Nombre</Text>
            <Text style={value}>{fullName}</Text>

            <Text style={label}>Email</Text>
            <Text style={value}>{email}</Text>

            <Text style={label}>Teléfono</Text>
            <Text style={value}>{phoneNumber}</Text>

            {!!countryCode && (
              <>
                <Text style={label}>Código país</Text>
                <Text style={value}>{countryCode}</Text>
              </>
            )}

            <Text style={label}>Idioma</Text>
            <Text style={value}>{language === "en" ? "English" : "Español"}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f4f6f8",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: "24px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  padding: "24px",
};

const heading = {
  margin: "0 0 16px",
  color: "#111827",
  fontSize: "24px",
  lineHeight: "1.3",
};

const section = {
  marginTop: "8px",
};

const paragraph = {
  color: "#374151",
  fontSize: "14px",
  margin: "0 0 12px",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "12px 0",
};

const label = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "12px 0 4px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};

const value = {
  color: "#111827",
  fontSize: "14px",
  margin: "0",
};
