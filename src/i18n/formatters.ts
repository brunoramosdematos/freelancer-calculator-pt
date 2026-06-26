import { getIntlLocale, SupportedLocale } from "@/i18n/locale";

export const NON_APPLICABLE_VALUE = "-";

type FormatterKind = "currency" | "number" | "integer" | "percentage";

export interface PercentageFormatOptions {
  signDisplay?: Intl.NumberFormatOptions["signDisplay"];
}

const formatterCache = new Map<string, Intl.NumberFormat>();
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const getNumberFormatter = (
  locale: SupportedLocale,
  kind: FormatterKind,
  options: Intl.NumberFormatOptions,
) => {
  const intlLocale = getIntlLocale(locale);
  const cacheKey = `${intlLocale}:${kind}:${JSON.stringify(options)}`;
  const cached = formatterCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.NumberFormat(intlLocale, options);
  formatterCache.set(cacheKey, formatter);
  return formatter;
};

export const formatCurrency = (
  value: number | null | undefined,
  locale: SupportedLocale,
  fractionDigits = 0,
): string => {
  if (!isFiniteNumber(value)) {
    return NON_APPLICABLE_VALUE;
  }

  return getNumberFormatter(locale, "currency", {
    style: "currency",
    currency: "EUR",
    currencyDisplay: "narrowSymbol",
    useGrouping: "always",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

export const formatNumber = (
  value: number | null | undefined,
  locale: SupportedLocale,
  fractionDigits = 0,
): string => {
  if (!isFiniteNumber(value)) {
    return NON_APPLICABLE_VALUE;
  }

  return getNumberFormatter(locale, "number", {
    useGrouping: "always",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

export const formatInteger = (
  value: number | null | undefined,
  locale: SupportedLocale,
): string => formatNumber(value, locale, 0);

export const formatPercentage = (
  value: number | null | undefined,
  locale: SupportedLocale,
  fractionDigits = 0,
  options: PercentageFormatOptions = {},
): string => {
  if (!isFiniteNumber(value)) {
    return NON_APPLICABLE_VALUE;
  }

  return getNumberFormatter(locale, "percentage", {
    style: "percent",
    useGrouping: "always",
    signDisplay: options.signDisplay,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

export const formatDateTime = (
  value: string | number | Date | null | undefined,
  locale: SupportedLocale,
): string => {
  if (value === null || value === undefined) {
    return NON_APPLICABLE_VALUE;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return NON_APPLICABLE_VALUE;
  }

  const intlLocale = getIntlLocale(locale);
  const cacheKey = `${intlLocale}:dateTime:medium-short`;
  const cached = dateFormatterCache.get(cacheKey);

  if (cached) {
    return cached.format(date);
  }

  const formatter = new Intl.DateTimeFormat(intlLocale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  dateFormatterCache.set(cacheKey, formatter);
  return formatter.format(date);
};

export const formatInputInteger = (
  value: number | null | undefined,
  locale: SupportedLocale,
): string => {
  if (!isFiniteNumber(value)) {
    return "";
  }

  return formatInteger(Math.trunc(value), locale);
};

export const parseInputInteger = (value: string): number | null => {
  if (value.trim() === "") {
    return null;
  }

  if (value.includes("-")) {
    return null;
  }

  const digits = value.replace(/\D/g, "");

  if (digits === "") {
    return null;
  }

  return Number(digits);
};
