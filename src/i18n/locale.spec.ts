import { afterEach, describe, expect, it, vi } from "vitest";
import { changeLocale, getCurrentLocale } from "@/i18n";
import { METADATA } from "@/i18n/metadata";
import {
  DEFAULT_LOCALE,
  detectLocale,
  getIntlLocale,
  LOCALE_STORAGE_KEY,
  LocaleStorage,
  normalizeLocale,
  persistLocale,
  readStoredLocale,
  SUPPORTED_LOCALES,
} from "@/i18n/locale";
import { languageNamesByLocale } from "@/i18n/locales";

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

  it("uses valid stored pt-BR", () => {
    expect(detectLocale({ storage: createStorage("pt-BR") })).toBe("pt-BR");
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

  it("normalizes Portuguese navigator languages to the supported regional locale", () => {
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["pt-PT"] } }),
    ).toBe("pt-PT");
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["pt"] } }),
    ).toBe("pt-PT");
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["pt-BR"] } }),
    ).toBe("pt-BR");
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["pt_PT"] } }),
    ).toBe("pt-PT");
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["pt_BR"] } }),
    ).toBe("pt-BR");
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["PT-br"] } }),
    ).toBe("pt-BR");
    expect(
      detectLocale({ storage: null, navigatorLike: { languages: ["pt-AO"] } }),
    ).toBe("pt-PT");
  });

  it("falls back to navigator.language", () => {
    expect(
      detectLocale({ storage: null, navigatorLike: { language: "pt-BR" } }),
    ).toBe("pt-BR");
  });

  it("normalizes exact locale values without matching generic pt before pt-BR", () => {
    expect(normalizeLocale("pt-BR")).toBe("pt-BR");
    expect(normalizeLocale("pt_BR")).toBe("pt-BR");
    expect(normalizeLocale("PT-br")).toBe("pt-BR");
    expect(normalizeLocale("pt-PT")).toBe("pt-PT");
    expect(normalizeLocale("pt")).toBe("pt-PT");
    expect(normalizeLocale("pt-AO")).toBe("pt-PT");
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("fr-FR")).toBeNull();
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

    expect(persistLocale("pt-BR", storage)).toBe(true);
    expect(readStoredLocale(storage)).toBe("pt-BR");
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

    changeLocale("pt-BR", createStorage());

    expect(document.documentElement.lang).toBe("pt-BR");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.title).toBe(METADATA["pt-BR"].title);
    expect(description?.content).toBe(METADATA["pt-BR"].description);

    changeLocale("en", createStorage());

    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe(METADATA.en.title);
    expect(description?.content).toBe(METADATA.en.description);
  });

  it("has metadata, language names, and Intl formatter locales for every supported locale", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "pt-PT", "pt-BR"]);
    expect(getIntlLocale("en")).toBe("en-GB");
    expect(getIntlLocale("pt-PT")).toBe("pt-PT");
    expect(getIntlLocale("pt-BR")).toBe("pt-BR");

    SUPPORTED_LOCALES.forEach((locale) => {
      expect(METADATA[locale].title).toBeTruthy();
      expect(METADATA[locale].description).toBeTruthy();
      expect(languageNamesByLocale[locale]).toBeTruthy();
    });
  });
});
