import type { InfoRequestContactType } from "~/data/data";

const DEFAULT_COUNTRY_CODE = "ES";
const DEFAULT_DIAL_CODE = "+34";

export function sanitizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeDialCode(value: string): string {
  const digits = sanitizePhoneDigits(value);
  return digits ? `+${digits}` : DEFAULT_DIAL_CODE;
}

export function normalizeInfoRequestContact(
  raw: unknown,
  fallback: Partial<InfoRequestContactType> = {},
): InfoRequestContactType {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const countryCodeSource =
    typeof source.countryCode === "string" ? source.countryCode : fallback.countryCode ?? DEFAULT_COUNTRY_CODE;
  const dialCodeSource =
    typeof source.dialCode === "string" ? source.dialCode : fallback.dialCode ?? DEFAULT_DIAL_CODE;
  const phoneNumberSource =
    typeof source.phoneNumber === "string" ? source.phoneNumber : fallback.phoneNumber ?? "";
  const messageSource = typeof source.message === "string" ? source.message : fallback.message ?? "";

  return {
    countryCode: (countryCodeSource || DEFAULT_COUNTRY_CODE).toUpperCase(),
    dialCode: normalizeDialCode(dialCodeSource || DEFAULT_DIAL_CODE),
    phoneNumber: sanitizePhoneDigits(phoneNumberSource),
    message: messageSource,
  };
}

export function getWhatsAppNumber(contact: InfoRequestContactType | null | undefined): string {
  if (!contact) {
    return "";
  }

  return `${sanitizePhoneDigits(contact.dialCode)}${sanitizePhoneDigits(contact.phoneNumber)}`;
}

export function hasValidInfoRequestContact(contact: InfoRequestContactType | null | undefined): boolean {
  return getWhatsAppNumber(contact).length >= 8;
}

export function buildWhatsAppUrl(contact: InfoRequestContactType | null | undefined): string | null {
  const whatsappNumber = getWhatsAppNumber(contact);
  if (whatsappNumber.length < 8) {
    return null;
  }

  const message = typeof contact?.message === "string" ? contact.message.trim() : "";
  const messageParam = message ? `?text=${encodeURIComponent(message)}` : "";

  return `https://wa.me/${whatsappNumber}${messageParam}`;
}
