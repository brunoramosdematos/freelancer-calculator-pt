export const SUPPORTED_LOCALES = ["en", "pt-PT", "pt-BR"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";
export const LOCALE_STORAGE_KEY = "freelancer-calculator-pt:locale:v1";

const INTL_LOCALES: Record<SupportedLocale, string> = {
  en: "en-GB",
  "pt-PT": "pt-PT",
  "pt-BR": "pt-BR",
};

export type LocaleStorage = Pick<Storage, "getItem" | "setItem">;

export interface LocaleNavigator {
  language?: string;
  languages?: readonly string[];
}

export const isSupportedLocale = (value: unknown): value is SupportedLocale =>
  typeof value === "string" &&
  SUPPORTED_LOCALES.includes(value as SupportedLocale);

export const normalizeLocale = (value: unknown): SupportedLocale | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().replace(/_/g, "-").toLowerCase();

  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en";
  }

  if (normalized === "pt-br") {
    return "pt-BR";
  }

  if (normalized === "pt" || normalized === "pt-pt") {
    return "pt-PT";
  }

  if (normalized.startsWith("pt-")) {
    return "pt-PT";
  }

  return null;
};

export const getIntlLocale = (locale: SupportedLocale): string =>
  INTL_LOCALES[locale] ?? INTL_LOCALES[DEFAULT_LOCALE];

const getBrowserStorage = (): LocaleStorage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const getBrowserNavigator = (): LocaleNavigator | null => {
  if (typeof navigator === "undefined") {
    return null;
  }

  return navigator;
};

export const readStoredLocale = (
  storage: LocaleStorage | null = getBrowserStorage(),
): SupportedLocale | null => {
  if (!storage) {
    return null;
  }

  try {
    const storedLocale = storage.getItem(LOCALE_STORAGE_KEY);
    return isSupportedLocale(storedLocale) ? storedLocale : null;
  } catch {
    return null;
  }
};

export const persistLocale = (
  locale: SupportedLocale,
  storage: LocaleStorage | null = getBrowserStorage(),
): boolean => {
  if (!isSupportedLocale(locale) || !storage) {
    return false;
  }

  try {
    storage.setItem(LOCALE_STORAGE_KEY, locale);
    return true;
  } catch {
    return false;
  }
};

export const detectLocale = ({
  storage = getBrowserStorage(),
  navigatorLike = getBrowserNavigator(),
}: {
  storage?: LocaleStorage | null;
  navigatorLike?: LocaleNavigator | null;
} = {}): SupportedLocale => {
  const storedLocale = readStoredLocale(storage);

  if (storedLocale) {
    return storedLocale;
  }

  const navigatorLanguages = navigatorLike?.languages ?? [];

  for (const language of navigatorLanguages) {
    const locale = normalizeLocale(language);

    if (locale) {
      return locale;
    }
  }

  const navigatorLocale = normalizeLocale(navigatorLike?.language);

  return navigatorLocale ?? DEFAULT_LOCALE;
};
