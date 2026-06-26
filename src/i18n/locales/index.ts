import enMessages, {
  languageName as enLanguageName,
  metadata as enMetadata,
} from "@/i18n/locales/en";
import ptPTMessages, {
  languageName as ptPTLanguageName,
  metadata as ptPTMetadata,
} from "@/i18n/locales/pt-PT";
import ptBRMessages, {
  languageName as ptBRLanguageName,
  metadata as ptBRMetadata,
} from "@/i18n/locales/pt-BR";
import type { SupportedLocale } from "@/i18n/locale";

export type LocaleMessageValue =
  | string
  | { readonly [key: string]: LocaleMessageValue };
export type LocaleMessages = { readonly [key: string]: LocaleMessageValue };

export interface LocaleMetadata {
  title: string;
  description: string;
}

export interface LocaleDefinition {
  languageName: string;
  metadata: LocaleMetadata;
  messages: LocaleMessages;
}

export const localeDefinitions = {
  en: {
    languageName: enLanguageName,
    metadata: enMetadata,
    messages: enMessages,
  },
  "pt-PT": {
    languageName: ptPTLanguageName,
    metadata: ptPTMetadata,
    messages: ptPTMessages,
  },
  "pt-BR": {
    languageName: ptBRLanguageName,
    metadata: ptBRMetadata,
    messages: ptBRMessages,
  },
} satisfies Record<SupportedLocale, LocaleDefinition>;

export const messages = {
  en: localeDefinitions.en.messages,
  "pt-PT": localeDefinitions["pt-PT"].messages,
  "pt-BR": localeDefinitions["pt-BR"].messages,
} as const;

export const metadataByLocale = {
  en: localeDefinitions.en.metadata,
  "pt-PT": localeDefinitions["pt-PT"].metadata,
  "pt-BR": localeDefinitions["pt-BR"].metadata,
} satisfies Record<SupportedLocale, LocaleMetadata>;

export const languageNamesByLocale = {
  en: localeDefinitions.en.languageName,
  "pt-PT": localeDefinitions["pt-PT"].languageName,
  "pt-BR": localeDefinitions["pt-BR"].languageName,
} satisfies Record<SupportedLocale, string>;
