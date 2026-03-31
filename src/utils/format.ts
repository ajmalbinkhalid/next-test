const DEFAULT_COUNTRY_DIAL_CODE = "+91";

export function formatSeconds(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function splitInstructionText(value: string) {
  const normalizedValue = value
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "")
    .replace(/<\/?(ol|ul|p|div|br)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return normalizedValue
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeIndianMobile(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const dialCodeDigits = DEFAULT_COUNTRY_DIAL_CODE.replace(/\D/g, "");
  const nationalNumber =
    digits.startsWith(dialCodeDigits) && digits.length > 10
      ? digits.slice(dialCodeDigits.length)
      : digits;

  return `${DEFAULT_COUNTRY_DIAL_CODE}${nationalNumber}`;
}

export function toNationalMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  const dialCodeDigits = DEFAULT_COUNTRY_DIAL_CODE.replace(/\D/g, "");

  if (digits.startsWith(dialCodeDigits) && digits.length > 10) {
    return digits.slice(dialCodeDigits.length);
  }

  return digits;
}
