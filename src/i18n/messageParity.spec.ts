import { describe, expect, it } from "vitest";
import { messages } from "@/i18n";

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
  it("keeps en and pt-PT message keys identical and non-empty", () => {
    const enMessages = flatten(messages.en);
    const ptMessages = flatten(messages["pt-PT"]);

    expect(Object.keys(ptMessages).sort()).toEqual(
      Object.keys(enMessages).sort(),
    );

    [enMessages, ptMessages].forEach((catalogue) => {
      Object.entries(catalogue).forEach(([key, value]) => {
        expect(value, key).not.toBeUndefined();
        expect(typeof value, key).toBe("string");
        expect((value as string).trim(), key).not.toBe("");
      });
    });
  });
});
