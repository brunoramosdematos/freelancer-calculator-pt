import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDateTime,
  formatInputInteger,
  formatInteger,
  formatNumber,
  formatPercentage,
  NON_APPLICABLE_VALUE,
  parseInputInteger,
} from "@/i18n/formatters";
import { getIntlLocale, SupportedLocale } from "@/i18n/locale";

const locales: SupportedLocale[] = ["en", "pt-PT", "pt-BR"];

describe("localized Intl formatters", () => {
  it("maps UI locales to explicit Intl locales", () => {
    expect(getIntlLocale("en")).toBe("en-GB");
    expect(getIntlLocale("pt-PT")).toBe("pt-PT");
    expect(getIntlLocale("pt-BR")).toBe("pt-BR");
  });

  it("formats EUR currency with locale-specific symbol placement", () => {
    expect(formatCurrency(5_000, "en")).toBe("€5,000");
    expect(formatCurrency(5_000, "pt-PT")).toBe("5\u00a0000\u00a0€");
    expect(formatCurrency(5_000, "pt-BR")).toBe("€\u00a05.000");

    expect(formatCurrency(1_234.56, "en", 2)).toBe("€1,234.56");
    expect(formatCurrency(1_234.56, "pt-PT", 2)).toBe("1\u00a0234,56\u00a0€");
    expect(formatCurrency(1_234.56, "pt-BR", 2)).toBe("€\u00a01.234,56");
  });

  it("keeps zero visible as a currency value", () => {
    expect(formatCurrency(0, "en")).toBe("€0");
    expect(formatCurrency(0, "pt-PT")).toBe("0\u00a0€");
    expect(formatCurrency(0, "pt-BR")).toBe("€\u00a00");

    expect(formatCurrency(0, "en", 2)).toBe("€0.00");
    expect(formatCurrency(0, "pt-PT", 2)).toBe("0,00\u00a0€");
    expect(formatCurrency(0, "pt-BR", 2)).toBe("€\u00a00,00");
  });

  it("formats large amounts and plain grouped integers in each locale", () => {
    expect(formatCurrency(60_000, "en", 2)).toBe("€60,000.00");
    expect(formatCurrency(60_000, "pt-PT", 2)).toBe("60\u00a0000,00\u00a0€");
    expect(formatCurrency(60_000, "pt-BR", 2)).toBe("€\u00a060.000,00");

    expect(formatInteger(60_000, "en")).toBe("60,000");
    expect(formatInteger(60_000, "pt-PT")).toBe("60\u00a0000");
    expect(formatInteger(60_000, "pt-BR")).toBe("60.000");

    expect(formatNumber(1_234.56, "en", 1)).toBe("1,234.6");
    expect(formatNumber(1_234.56, "pt-PT", 1)).toBe("1\u00a0234,6");
    expect(formatNumber(1_234.56, "pt-BR", 1)).toBe("1.234,6");
  });

  it("formats percentages without changing decimal semantics", () => {
    locales.forEach((locale) => {
      expect(formatPercentage(-0.2, locale)).toBe("-20%");
      expect(formatPercentage(0, locale)).toBe("0%");
      expect(formatPercentage(0.25, locale)).toBe("25%");
      expect(
        formatPercentage(0.25, locale, 0, { signDisplay: "exceptZero" }),
      ).toBe("+25%");
    });
  });

  it("formats and parses integer input without changing raw values", () => {
    expect(formatInputInteger(60_000, "en")).toBe("60,000");
    expect(formatInputInteger(60_000, "pt-PT")).toBe("60\u00a0000");
    expect(formatInputInteger(60_000, "pt-BR")).toBe("60.000");

    expect(parseInputInteger("60,000")).toBe(60_000);
    expect(parseInputInteger("60\u00a0000")).toBe(60_000);
    expect(parseInputInteger("60.000")).toBe(60_000);
    expect(parseInputInteger("€\u00a060.000")).toBe(60_000);
    expect(parseInputInteger("5\u00a0000\u00a0€")).toBe(5_000);
    expect(parseInputInteger("")).toBeNull();
    expect(parseInputInteger("0")).toBe(0);
    expect(parseInputInteger("-100")).toBeNull();
  });

  it("formats dates through the mapped Intl locale without serializing them", () => {
    const value = new Date(2026, 5, 26, 12, 34);

    locales.forEach((locale) => {
      expect(formatDateTime(value, locale)).toBe(
        new Intl.DateTimeFormat(getIntlLocale(locale), {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(value),
      );
    });
  });

  it("uses a non-applicable marker only for null, undefined, NaN, or invalid dates", () => {
    expect(formatCurrency(null, "en")).toBe(NON_APPLICABLE_VALUE);
    expect(formatCurrency(Number.NaN, "en")).toBe(NON_APPLICABLE_VALUE);
    expect(formatNumber(undefined, "pt-PT")).toBe(NON_APPLICABLE_VALUE);
    expect(formatPercentage(Number.POSITIVE_INFINITY, "pt-BR")).toBe(
      NON_APPLICABLE_VALUE,
    );
    expect(formatDateTime("not-a-date", "en")).toBe(NON_APPLICABLE_VALUE);
    expect(formatInputInteger(undefined, "en")).toBe("");
  });
});
