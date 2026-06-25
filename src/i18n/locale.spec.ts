import { afterEach, describe, expect, it, vi } from "vitest";
import { changeLocale, getCurrentLocale } from "@/i18n";
import { METADATA } from "@/i18n/metadata";
import {
  DEFAULT_LOCALE,
  detectLocale,
  LOCALE_STORAGE_KEY,
  LocaleStorage,
  persistLocale,
  readStoredLocale,
} from "@/i18n/locale";

const createStorage = (
  initialValue?: string,
): LocaleStorage & {
  entries: Map<string, string>;
} => {
  const entries = new Map<string, string>();

  if (initialValue !== undefined) {
    entries.set(LOCALE_STORAGE_KEY, initialValue);
  }

  return {
    entries,
    getItem: vi.fn((key: string) => entries.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      entries.set(key, value);
    }),
  };
};

afterEach(() => {
  changeLocale(DEFAULT_LOCALE, createStorage());
  localStorage.clear();
});

describe("locale detection", () => {
  it("uses valid stored English", () => {
    expect(detectLocale({ storage: createStorage("en") })).toBe("en");
  });

  it("uses valid stored pt-PT", () => {
    expect(detectLocale({ storage: createStorage("pt-PT") })).toBe("pt-PT");
  });

  it("ignores invalid stored values", () => {
    expect(
      detectLocale({
        storage: createStorage("fr"),
        navigatorLike: { languages: ["pt-PT"] },
      }),
    ).toBe("pt-PT");
  });

  it("normalizes English navigator languages", () => {
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["en-US"] } }),
    ).toBe("en");
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["en-GB"] } }),
    ).toBe("en");
  });

  it("normalizes Portuguese navigator languages to pt-PT", () => {
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["pt-PT"] } }),
    ).toBe("pt-PT");
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["pt"] } }),
    ).toBe("pt-PT");
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["pt-BR"] } }),
    ).toBe("pt-PT");
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["pt_PT"] } }),
    ).toBe("pt-PT");
  });

  it("falls back to navigator.language", () => {
    expect(
      detectLocale({ storage: null, navigatorLike: { language: "pt-BR" } }),
    ).toBe("pt-PT");
  });

  it("falls back to English for unsupported or missing navigator values", () => {
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["fr-FR"] } }),
    ).toBe("en");
    expect(detectLocale({ storage: null, navigatorLike: null })).toBe("en");
  });

  it("ignores localStorage read exceptions", () => {
    const throwingStorage: LocaleStorage = {
      getItem: vi.fn(() => {
        throw new Error("denied");
      }),
      setItem: vi.fn(),
    };

    expect(
      detectLocale({
        storage: throwingStorage,
        navigatorLike: { languages: ["en-US"] },
      }),
    ).toBe("en");
  });
});

describe("locale persistence and metadata", () => {
  it("saves a valid locale", () => {
    const storage = createStorage();

    expect(persistLocale("pt-PT", storage)).toBe(true);
    expect(readStoredLocale(storage)).toBe("pt-PT");
  });

  it("rejects an invalid locale", () => {
    const storage = createStorage();

    expect(persistLocale("fr" as never, storage)).toBe(false);
    expect(storage.entries.has(LOCALE_STORAGE_KEY)).toBe(false);
  });

  it("keeps in-memory locale when localStorage write fails", () => {
    const throwingStorage: LocaleStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new Error("quota");
      }),
    };

    expect(changeLocale("pt-PT", throwingStorage)).toBe(true);
    expect(getCurrentLocale()).toBe("pt-PT");
  });

  it("updates html lang, title, description, and switches back to English", () => {
    document
      .querySelectorAll('meta[name="description"]')
      .forEach((element) => element.remove());

    changeLocale("pt-PT", createStorage());
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    expect(document.documentElement.lang).toBe("pt-PT");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(METADATA["pt-PT"].title);
    expect(description?.content).toBe(METADATA["pt-PT"].description);

    changeLocale("en", createStorage());

    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe(METADATA.en.title);
    expect(description?.content).toBe(METADATA.en.description);
  });
});
