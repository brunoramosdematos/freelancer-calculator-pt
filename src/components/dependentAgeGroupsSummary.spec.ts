import { describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import { getDependentAgeGroupsSummaryDescriptor } from "@/components/dependentAgeGroupsSummary";
import { messages } from "@/i18n";
import { SupportedLocale } from "@/i18n/locale";

const translateSummary = (
  locale: SupportedLocale,
  total: number,
  aged3OrUnder: number,
  aged4To6: number,
) => {
  const i18n = createI18n({
    legacy: false,
    locale,
    messages,
  });
  const descriptor = getDependentAgeGroupsSummaryDescriptor(
    total,
    aged3OrUnder,
    aged4To6,
  );

  return i18n.global.t(
    descriptor.key,
    descriptor.values ?? {},
    descriptor.plural,
  );
};

describe("dependent age groups summary", () => {
  it("summarizes one dependent when all are aged 7+ in English", () => {
    expect(translateSummary("en", 1, 0, 0)).toBe(
      "The dependent is currently treated as aged 7+.",
    );
  });

  it("summarizes one dependent when all are aged 7+ in pt-PT", () => {
    expect(translateSummary("pt-PT", 1, 0, 0)).toBe(
      "O dependente é atualmente considerado como tendo 7 anos ou mais.",
    );
  });

  it("summarizes multiple dependents when all are aged 7+ in English", () => {
    expect(translateSummary("en", 2, 0, 0)).toBe(
      "All 2 dependents are currently treated as aged 7+.",
    );
  });

  it("summarizes multiple dependents when all are aged 7+ in pt-PT", () => {
    expect(translateSummary("pt-PT", 2, 0, 0)).toBe(
      "Os 2 dependentes são atualmente considerados como tendo 7 anos ou mais.",
    );
  });

  it("summarizes mixed age groups with all three counts in English", () => {
    expect(translateSummary("en", 3, 1, 1)).toBe(
      "1 aged 3 or under · 1 aged 4–6 · 1 aged 7+",
    );
  });

  it("summarizes mixed age groups with all three counts in pt-PT", () => {
    expect(translateSummary("pt-PT", 3, 1, 1)).toBe(
      "1 até 3 anos · 1 dos 4 aos 6 anos · 1 com 7 anos ou mais",
    );
  });

  it("keeps zero younger age values visible when another younger group is active in English", () => {
    expect(translateSummary("en", 2, 0, 1)).toBe(
      "0 aged 3 or under · 1 aged 4–6 · 1 aged 7+",
    );
  });

  it("keeps zero younger age values visible when another younger group is active in pt-PT", () => {
    expect(translateSummary("pt-PT", 2, 0, 1)).toBe(
      "0 até 3 anos · 1 dos 4 aos 6 anos · 1 com 7 anos ou mais",
    );
  });

  it("returns a stable empty-state summary for zero dependents in both locales", () => {
    expect(translateSummary("en", 0, 0, 0)).toBe("No dependents.");
    expect(translateSummary("pt-PT", 0, 0, 0)).toBe("Sem dependentes.");
  });
});
