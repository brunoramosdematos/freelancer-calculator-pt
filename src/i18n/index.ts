import { createI18n } from "vue-i18n";
import { applyDocumentMetadata } from "@/i18n/metadata";
import { messages } from "@/i18n/locales";
import {
  DEFAULT_LOCALE,
  detectLocale,
  isSupportedLocale,
  LocaleStorage,
  persistLocale,
  SupportedLocale,
} from "@/i18n/locale";

export { messages };

export const i18n = createI18n({
  legacy: false,
  globalInjection: false,
  locale: detectLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages,
});

export const getCurrentLocale = (): SupportedLocale =>
  i18n.global.locale.value as SupportedLocale;

export const changeLocale = (
  locale: unknown,
  storage?: LocaleStorage | null,
): boolean => {
  if (!isSupportedLocale(locale)) {
    return false;
  }

  i18n.global.locale.value = locale;
  persistLocale(locale, storage);
  applyDocumentMetadata(locale);

  return true;
};

applyDocumentMetadata(getCurrentLocale());
