import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { messages } from "@/i18n";
import {
  DEFAULT_TAX_RANK_YEAR,
  SUPPORTED_TAX_RANK_YEARS,
  useTaxesStore,
} from "@/store";
import type { TaxDataCoverage } from "@/taxData/provenance";
import {
  getFiscalCoverageStatus,
  getLatestSupportedTaxYear,
  getSelectedTaxYearStatus,
  taxDataCoverage,
  validateTaxDataCoverage,
} from "@/taxData/provenance";

const cloneCoverage = (): TaxDataCoverage =>
  JSON.parse(JSON.stringify(taxDataCoverage)) as TaxDataCoverage;

describe("tax data provenance", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("derives the latest supported year from provenance metadata", () => {
    expect(getLatestSupportedTaxYear(taxDataCoverage)).toBe(2026);
    expect(taxDataCoverage.latestSupportedTaxYear).toBe(2026);
  });

  it("tracks the current dynamic default year", () => {
    expect(DEFAULT_TAX_RANK_YEAR).toBe(2026);
  });

  it("provides metadata for every supported store tax year", () => {
    const provenanceYears = taxDataCoverage.years.map((year) => year.taxYear);

    expect(taxDataCoverage.supportedTaxYears).toEqual(SUPPORTED_TAX_RANK_YEARS);
    expect(provenanceYears.sort((a, b) => b - a)).toEqual(
      SUPPORTED_TAX_RANK_YEARS,
    );
    expect(
      validateTaxDataCoverage(taxDataCoverage, SUPPORTED_TAX_RANK_YEARS),
    ).toEqual([]);
  });

  it("maps every metadata year to tax ranks, IAS values, and Youth IRS data", () => {
    const store = useTaxesStore();

    taxDataCoverage.years.forEach(({ taxYear }) => {
      const supportedYear =
        taxYear as (typeof SUPPORTED_TAX_RANK_YEARS)[number];

      expect(store.taxRanks[supportedYear]?.length).toBeGreaterThan(0);
      expect(store.iasPerYear[supportedYear]).toBeGreaterThan(0);
      expect(Object.keys(store.youthIrs[supportedYear]).length).toBeGreaterThan(
        0,
      );
    });
  });

  it("returns latest-supported status for the latest year", () => {
    expect(getSelectedTaxYearStatus(2026, taxDataCoverage).kind).toBe(
      "latest-supported",
    );
  });

  it("returns historical-supported status for an older supported year", () => {
    expect(getSelectedTaxYearStatus(2024, taxDataCoverage).kind).toBe(
      "historical-supported",
    );
  });

  it("returns unsupported status for a future unsupported year", () => {
    const status = getSelectedTaxYearStatus(2027, taxDataCoverage);

    expect(status.kind).toBe("unsupported");
    expect(status.severity).toBe("danger");
  });

  it("requires review when the current date is after the latest supported year", () => {
    const status = getFiscalCoverageStatus(
      new Date(Date.UTC(2027, 0, 1)),
      taxDataCoverage,
    );

    expect(status.kind).toBe("review-required");
    expect(status.severity).toBe("warning");
  });

  it("reports current coverage while the date is within the supported range", () => {
    const status = getFiscalCoverageStatus(
      new Date(Date.UTC(2026, 11, 31)),
      taxDataCoverage,
    );

    expect(status.kind).toBe("current");
    expect(status.severity).toBe("neutral");
  });

  it("rejects invalid reviewedAt dates", () => {
    const coverage = cloneCoverage();
    coverage.years[0].reviewedAt = "2026-13-01";

    expect(
      validateTaxDataCoverage(coverage, SUPPORTED_TAX_RANK_YEARS),
    ).toContainEqual(expect.objectContaining({ code: "invalid-reviewed-at" }));
  });

  it("rejects unknown source ids", () => {
    const coverage = cloneCoverage();
    coverage.years[0].sourceIds = ["missing-source"];

    expect(
      validateTaxDataCoverage(coverage, SUPPORTED_TAX_RANK_YEARS),
    ).toContainEqual(expect.objectContaining({ code: "unknown-source-id" }));
  });

  it("requires HTTPS source URLs", () => {
    const coverage = cloneCoverage();

    expect(
      taxDataCoverage.sources.every((source) =>
        source.url.startsWith("https://"),
      ),
    ).toBe(true);

    coverage.sources[0].url = "http://example.test/source";

    expect(
      validateTaxDataCoverage(coverage, SUPPORTED_TAX_RANK_YEARS),
    ).toContainEqual(expect.objectContaining({ code: "non-https-source-url" }));
  });

  it("does not include provenance for unsupported years", () => {
    const unsupportedProvenance = taxDataCoverage.years.filter(
      ({ taxYear }) => !SUPPORTED_TAX_RANK_YEARS.includes(taxYear),
    );

    expect(unsupportedProvenance).toEqual([]);
    expect(
      validateTaxDataCoverage(taxDataCoverage, SUPPORTED_TAX_RANK_YEARS),
    ).not.toContainEqual(
      expect.objectContaining({ code: "unsupported-provenance-year" }),
    );
  });

  it("adds taxData message keys for every locale", () => {
    expect(messages.en.taxData.status.latestSupported).toBeTruthy();
    expect(messages["pt-PT"].taxData.status.reviewedAt).toContain("revisto");
    expect(messages["pt-BR"].taxData.status.reviewedAt).toContain("revisado");
  });
});
