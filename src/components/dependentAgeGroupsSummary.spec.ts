import { describe, expect, it } from "vitest";
import { formatDependentAgeGroupsSummary } from "@/components/dependentAgeGroupsSummary";

describe("dependent age groups summary", () => {
  it("summarizes one dependent when all are aged 7+", () => {
    expect(formatDependentAgeGroupsSummary(1, 0, 0)).toBe(
      "The dependent is currently treated as aged 7+.",
    );
  });

  it("summarizes multiple dependents when all are aged 7+", () => {
    expect(formatDependentAgeGroupsSummary(2, 0, 0)).toBe(
      "All 2 dependents are currently treated as aged 7+.",
    );
  });

  it("summarizes mixed age groups with all three counts", () => {
    expect(formatDependentAgeGroupsSummary(3, 1, 1)).toBe(
      "1 aged 3 or under · 1 aged 4–6 · 1 aged 7+",
    );
  });

  it("keeps zero younger age values visible when another younger group is active", () => {
    expect(formatDependentAgeGroupsSummary(2, 0, 1)).toBe(
      "0 aged 3 or under · 1 aged 4–6 · 1 aged 7+",
    );
  });

  it("returns a stable empty-state summary for zero dependents", () => {
    expect(formatDependentAgeGroupsSummary(0, 0, 0)).toBe("No dependents.");
  });
});
