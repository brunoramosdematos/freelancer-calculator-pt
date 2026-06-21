import { describe, expect, it } from "vitest";
import { calculateDependentTaxDeduction } from "@/store/dependentDeduction";

describe("dependent tax deduction", () => {
  it.each([
    { total: 0, young: 0, middle: 0, expected: 0 },
    { total: 1, young: 1, middle: 0, expected: 726 },
    { total: 2, young: 1, middle: 1, expected: 1500 },
    { total: 3, young: 2, middle: 1, expected: 2400 },
    { total: 3, young: 3, middle: 0, expected: 2526 },
    { total: 3, young: 1, middle: 0, expected: 2100 },
    { total: 2, young: 0, middle: 0, expected: 1200 },
  ])(
    "returns EUR $expected for total=$total, <=3=$young, 4-6=$middle",
    ({ total, young, middle, expected }) => {
      expect(calculateDependentTaxDeduction(total, young, middle)).toBe(
        expected,
      );
    },
  );
});
