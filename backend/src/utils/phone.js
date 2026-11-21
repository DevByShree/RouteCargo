const DEFAULT_COUNTRY_CODE = String(process.env.DEFAULT_PHONE_COUNTRY_CODE || "91")
  .replace(/\D/g, "");

function normalizePhone(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  let digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && DEFAULT_COUNTRY_CODE) digits = `${DEFAULT_COUNTRY_CODE}${digits}`;
  else if (digits.length === 11 && digits.startsWith("0") && DEFAULT_COUNTRY_CODE) {
    digits = `${DEFAULT_COUNTRY_CODE}${digits.slice(1)}`;
  }

  return digits.length >= 8 && digits.length <= 15 && !digits.startsWith("0")
    ? `+${digits}`
    : "";
}

function phoneLookupValues(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return [];
  const digits = normalized.slice(1);
  const variants = new Set([normalized, digits]);
  if (digits.startsWith(DEFAULT_COUNTRY_CODE) && digits.length === DEFAULT_COUNTRY_CODE.length + 10) {
    const national = digits.slice(DEFAULT_COUNTRY_CODE.length);
    variants.add(national);
    variants.add(`0${national}`);
    variants.add(`+${DEFAULT_COUNTRY_CODE} ${national}`);
  }
  return [...variants];
}

function phoneLookupConditions(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return [];
  const digits = normalized.slice(1);
  const escapedDigits = (value) => value.split("").join("[\\s().-]*");
  const patterns = [new RegExp(`^\\+?${escapedDigits(digits)}$`)];
  if (digits.startsWith(DEFAULT_COUNTRY_CODE) && digits.length === DEFAULT_COUNTRY_CODE.length + 10) {
    patterns.push(new RegExp(`^0?${escapedDigits(digits.slice(DEFAULT_COUNTRY_CODE.length))}$`));
  }
  return [
    { phone: { $in: phoneLookupValues(normalized) } },
    ...patterns.map((pattern) => ({ phone: pattern })),
  ];
}

module.exports = { normalizePhone, phoneLookupValues, phoneLookupConditions };
