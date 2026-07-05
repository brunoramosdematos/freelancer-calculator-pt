import { describe, expect, it, vi } from "vitest";

import {
  getDefaultTaxYear,
  getRuntimeDefaultTaxYear,
} from "@/taxData/defaultTaxYear";

describe("default tax year", () => {
  it("returns the current calendar year when it is supported", () => {
    expect(
      getDefaultTaxYear({
        currentDate: new Date(2026, 6, 5),
        supportedTaxYears: [2023, 2024, 2025, 2026],
      }),
    ).toBe(2026);
  });

  it("returns the latest supported year when the current year is in the future", () => {
    expect(
      getDefaultTaxYear({
        currentDate: new Date(2028, 0, 1),
        supportedTaxYears: [2023, 2024, 2025, 2026, 2027],
      }),
    ).toBe(2027);
  });

  it("returns the earliest supported year when the current year is too early", () => {
    expect(
      getDefaultTaxYear({
        currentDate: new Date(2022, 0, 1),
        supportedTaxYears: [2023, 2024],
      }),
    ).toBe(2023);
  });

  it("normalizes unsorted supported years", () => {
    expect(
      getDefaultTaxYear({
        currentDate: new Date(2028, 0, 1),
        supportedTaxYears: [2025, 2023, 2027, 2024, 2026],
      }),
    ).toBe(2027);
  });

  it("throws a clear error when no supported years exist", () => {
    expect(() =>
      getDefaultTaxYear({
        currentDate: new Date(2026, 0, 1),
        supportedTaxYears: [],
      }),
    ).toThrow("Cannot determine default tax year without supported years.");
  });

  it("does not mutate the supported years array", () => {
    const supportedTaxYears = [2025, 2023, 2026, 2024];

    getDefaultTaxYear({
      currentDate: new Date(2028, 0, 1),
      supportedTaxYears,
    });

    expect(supportedTaxYears).toEqual([2025, 2023, 2026, 2024]);
  });

  it("derives the runtime default from tax-data coverage", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 5));

    try {
      expect(getRuntimeDefaultTaxYear()).toBe(2026);
    } finally {
      vi.useRealTimers();
    }
  });
});
