/**
 * Normalizes and formats a phone number with country code.
 * Strips out spaces, dashes, parentheses, plus sign, etc.
 * Prepends default country code (91) if missing.
 */
export const formatPhoneNumber = (phone, defaultCountryCode = "91") => {
  if (!phone) return null;
  // Remove all non-digit characters
  let formatted = phone.toString().replace(/\D/g, "");
  // If user entered e.g. 09876543210, strip leading 0
  if (formatted.length === 11 && formatted.startsWith("0")) {
    formatted = formatted.substring(1);
  }
  // If already starts with the country code, return as is
  if (formatted.startsWith(defaultCountryCode)) {
    return formatted;
  }
  // Prepend country code
  return `${defaultCountryCode}${formatted}`;
};

export default formatPhoneNumber;
