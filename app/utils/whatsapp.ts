import type { InfoRequestContactType } from "~/data/data";

const DEFAULT_COUNTRY_CODE = "ES";
const DEFAULT_DIAL_CODE = "+34";
export const DEFAULT_INFO_REQUEST_EMAIL = "tourtovalencia@gmail.com";
const DEFAULT_INFO_REQUEST_MESSAGE = "Hola, me gustaría pedir información sobre este servicio.";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(normalizeEmail(value));
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

  const enablePhoneSource =
    typeof source.enablePhone === "boolean" ? source.enablePhone : (fallback.enablePhone ?? true);
  const enableEmailSource =
    typeof source.enableEmail === "boolean" ? source.enableEmail : (fallback.enableEmail ?? true);
  const emailSource =
    typeof source.email === "string" ? source.email : (fallback.email ?? DEFAULT_INFO_REQUEST_EMAIL);

  const countryCodeSource =
    typeof source.countryCode === "string" ? source.countryCode : fallback.countryCode ?? DEFAULT_COUNTRY_CODE;
  const dialCodeSource =
    typeof source.dialCode === "string" ? source.dialCode : fallback.dialCode ?? DEFAULT_DIAL_CODE;
  const phoneNumberSource =
    typeof source.phoneNumber === "string" ? source.phoneNumber : fallback.phoneNumber ?? "";
  const messageSource =
    typeof source.message === "string" ? source.message : fallback.message ?? DEFAULT_INFO_REQUEST_MESSAGE;

  const enablePhone = enablePhoneSource || (!enablePhoneSource && !enableEmailSource);
  const enableEmail = enableEmailSource || (!enablePhoneSource && !enableEmailSource);

  return {
    enablePhone,
    enableEmail,
    email: normalizeEmail(emailSource || DEFAULT_INFO_REQUEST_EMAIL),
    countryCode: (countryCodeSource || DEFAULT_COUNTRY_CODE).toUpperCase(),
    dialCode: normalizeDialCode(dialCodeSource || DEFAULT_DIAL_CODE),
    phoneNumber: sanitizePhoneDigits(phoneNumberSource),
    message: messageSource || DEFAULT_INFO_REQUEST_MESSAGE,
  };
}

export function getWhatsAppNumber(contact: InfoRequestContactType | null | undefined): string {
  if (!contact || !contact.enablePhone) {
    return "";
  }

  return `${sanitizePhoneDigits(contact.dialCode)}${sanitizePhoneDigits(contact.phoneNumber)}`;
}

export function hasValidInfoRequestContact(contact: InfoRequestContactType | null | undefined): boolean {
  const hasPhone = contact?.enablePhone ? getWhatsAppNumber(contact).length >= 8 : false;
  const hasEmail = contact?.enableEmail ? isValidEmail(contact.email) : false;
  return hasPhone || hasEmail;
}

export function hasValidPhoneInfoRequestContact(contact: InfoRequestContactType | null | undefined): boolean {
  if (!contact?.enablePhone) {
    return false;
  }

  return getWhatsAppNumber(contact).length >= 8;
}

export function hasValidEmailInfoRequestContact(contact: InfoRequestContactType | null | undefined): boolean {
  if (!contact?.enableEmail) {
    return false;
  }

  return isValidEmail(contact.email);
}

export function buildWhatsAppUrl(contact: InfoRequestContactType | null | undefined): string | null {
  if (!contact?.enablePhone) {
    return null;
  }

  const whatsappNumber = getWhatsAppNumber(contact);
  if (whatsappNumber.length < 8) {
    return null;
  }

  const message = typeof contact?.message === "string" ? contact.message.trim() : "";
  const messageParam = message ? `?text=${encodeURIComponent(message)}` : "";

  return `https://wa.me/${whatsappNumber}${messageParam}`;
}
