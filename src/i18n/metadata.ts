import { DEFAULT_LOCALE, SupportedLocale } from "@/i18n/locale";
import { LocaleMetadata, metadataByLocale } from "@/i18n/locales";

export const METADATA: Record<SupportedLocale, LocaleMetadata> =
  metadataByLocale;

const getMetadata = (locale: SupportedLocale) =>
  METADATA[locale] ?? METADATA[DEFAULT_LOCALE];

export const applyDocumentMetadata = (locale: SupportedLocale) => {
  if (typeof document === "undefined") {
    return;
  }

  const metadata = getMetadata(locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = "ltr";
  document.title = metadata.title;

  let description = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );

  if (!description) {
    description = document.createElement("meta");
    description.name = "description";
    document.head.append(description);
  }

  description.content = metadata.description;
};
