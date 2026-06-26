import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  formatCurrency as formatCurrencyValue,
  formatDateTime as formatDateTimeValue,
  formatInputInteger as formatInputIntegerValue,
  formatInteger as formatIntegerValue,
  formatNumber as formatNumberValue,
  formatPercentage as formatPercentageValue,
  parseInputInteger,
  PercentageFormatOptions,
} from "@/i18n/formatters";
import { SupportedLocale } from "@/i18n/locale";

export const useLocalizedFormatters = () => {
  const { locale } = useI18n({ useScope: "global" });
  const currentLocale = computed(() => locale.value as SupportedLocale);

  return {
    formatCurrency: (value: number | null | undefined, fractionDigits = 0) =>
      formatCurrencyValue(value, currentLocale.value, fractionDigits),
    formatDateTime: (value: string | number | Date | null | undefined) =>
      formatDateTimeValue(value, currentLocale.value),
    formatInputInteger: (value: number | null | undefined) =>
      formatInputIntegerValue(value, currentLocale.value),
    formatInteger: (value: number | null | undefined) =>
      formatIntegerValue(value, currentLocale.value),
    formatNumber: (value: number | null | undefined, fractionDigits = 0) =>
      formatNumberValue(value, currentLocale.value, fractionDigits),
    formatPercentage: (
      value: number | null | undefined,
      fractionDigits = 0,
      options: PercentageFormatOptions = {},
    ) =>
      formatPercentageValue(
        value,
        currentLocale.value,
        fractionDigits,
        options,
      ),
    parseInputInteger,
  };
};
