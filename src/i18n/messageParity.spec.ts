import { describe, expect, it } from "vitest";
import { messages } from "@/i18n";
import { getIntlLocale, SUPPORTED_LOCALES } from "@/i18n/locale";
import { languageNamesByLocale, metadataByLocale } from "@/i18n/locales";

const flatten = (
  value: unknown,
  prefix = "",
  result: Record<string, unknown> = {},
) => {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    Object.entries(value).forEach(([key, child]) => {
      flatten(child, prefix ? `${prefix}.${key}` : key, result);
    });

    return result;
  }

  result[prefix] = value;
  return result;
};

describe("locale message parity", () => {
  it("keeps all locale message keys identical and non-empty", () => {
    const referenceMessages = flatten(messages.en);
    const referenceKeys = Object.keys(referenceMessages).sort();

    SUPPORTED_LOCALES.forEach((locale) => {
      const catalogue = flatten(messages[locale]);

      expect(Object.keys(catalogue).sort()).toEqual(referenceKeys);
      Object.entries(catalogue).forEach(([key, value]) => {
        expect(value, key).not.toBeUndefined();
        expect(typeof value, key).toBe("string");
        expect((value as string).trim(), key).not.toBe("");
      });
    });
  });

  it("keeps report export messages available in every locale", () => {
    SUPPORTED_LOCALES.forEach((locale) => {
      expect(messages[locale].report.actions.export).toBeTruthy();
      expect(messages[locale].report.actions.print).toBeTruthy();
      expect(messages[locale].report.rows.grossIncome).toBeTruthy();
      expect(messages[locale].report.disclaimerText).toBeTruthy();
    });
  });

  it("keeps scenario comparison messages available in every locale", () => {
    SUPPORTED_LOCALES.forEach((locale) => {
      expect(messages[locale].scenarioComparison.title).toBeTruthy();
      expect(
        messages[locale].scenarioComparison.presets.jointSingleIncome.label,
      ).toBeTruthy();
      expect(messages[locale].scenarioComparison.table.best).toBeTruthy();
      expect(
        messages[locale].scenarioComparison.card.annualNetIncome,
      ).toBeTruthy();
      expect(
        messages[locale].scenarioComparison.card.monthlyNetIncome,
      ).toBeTruthy();
      expect(
        messages[locale].scenarioComparison.card.supportingMetrics,
      ).toBeTruthy();
      expect(messages[locale].scenarioComparison.card.keyResult).toBeTruthy();
      expect(
        messages[locale].scenarioComparison.table.currentChip,
      ).toBeTruthy();
      expect(
        messages[locale].scenarioComparison.table.alternativeChip,
      ).toBeTruthy();
      expect(messages[locale].scenarioComparison.table.bestChip).toBeTruthy();
      expect(
        messages[locale].scenarioComparison.table.bestChipAriaLabel,
      ).toBeTruthy();
      expect(
        messages[locale].scenarioComparison.statuses.betterThanCurrent,
      ).toBeTruthy();
    });
  });
  it("keeps locale metadata, language names, and formatter locales complete", () => {
    SUPPORTED_LOCALES.forEach((locale) => {
      expect(metadataByLocale[locale].title).toBeTruthy();
      expect(metadataByLocale[locale].description).toBeTruthy();
      expect(languageNamesByLocale[locale]).toBeTruthy();
      expect(getIntlLocale(locale)).toBeTruthy();
    });

    expect(messages.en).not.toHaveProperty("metadata");
    expect(messages["pt-PT"]).not.toHaveProperty("metadata");
    expect(messages["pt-BR"]).not.toHaveProperty("metadata");
  });
});
