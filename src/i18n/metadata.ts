import { DEFAULT_LOCALE, SupportedLocale } from "@/i18n/locale";

export interface LocaleMetadata {
  title: string;
  description: string;
}

export const METADATA: Record<SupportedLocale, LocaleMetadata> = {
  en: {
    title: "Freelancer Calculator Portugal | IRS & Social Security",
    description:
      "Open-source tax, Social Security, and income calculator for freelancers in Portugal.",
  },
  "pt-PT": {
    title: "Calculadora para Freelancers em Portugal | IRS e Segurança Social",
    description:
      "Calculadora open source para estimar o rendimento líquido, o IRS português e as contribuições para a Segurança Social de trabalhadores independentes, incluindo tributação individual, tributação conjunta com um único rendimento e deduções por dependentes.",
  },
};

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
