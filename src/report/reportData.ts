import type { useTaxesStore } from "@/store";
import type { AssessmentScenario, FrequencyChoices } from "@/typings";
import {
  getSelectedTaxYearStatus,
  taxDataCoverage,
  type SelectedTaxYearStatus,
  type TaxDataCoverage,
} from "@/taxData/provenance";

export const REPORT_PRODUCTION_URL = "https://freelancerpt.brunomatos.dev/";

type TaxesStoreSnapshot = ReturnType<typeof useTaxesStore>;
type FrequencyValues = {
  year: number;
  month: number;
  day: number;
};

export type ReportData = {
  generatedAt: Date;
  productName: string;
  titleKey: string;
  productionUrl: string;
  currentUrl: string | null;
  summary: {
    grossIncome: FrequencyValues;
    netIncome: FrequencyValues;
    totalTaxes: FrequencyValues;
    irs: FrequencyValues;
    socialSecurity: FrequencyValues;
    displayFrequency: FrequencyChoices;
  };
  assumptions: {
    taxYear: number;
    assessmentScenario: AssessmentScenario;
    incomeFrequency: FrequencyChoices;
    displayFrequency: FrequencyChoices;
    paidMonths: number;
    unpaidDays: number;
    dependents: {
      total: number;
      aged3OrUnder: number;
      aged4To6: number;
      aged7OrOver: number;
    };
    socialSecurityAdjustment: number;
    socialSecurityFirstYearExemption: boolean;
    firstFiscalYear: boolean;
    secondFiscalYear: boolean;
    youthIrs: {
      active: boolean;
      year: number;
    };
    rnh: boolean;
    expenses: {
      mode: "automatic" | "manual";
      amount: number;
      stillNeeded: number;
    };
  };
  taxBreakdown: {
    irsBeforeDependentDeduction: number;
    dependentDeductionApplied: number;
    finalIrs: number;
    socialSecurityContribution: number;
    netIncome: number;
  };
  fiscalData: {
    selectedTaxYear: number;
    latestSupportedTaxYear: number;
    lastReviewedAt: string;
    status: SelectedTaxYearStatus;
    sourceLabelKeys: string[];
    estimateDisclaimerKey: string;
  };
};

export type CreateReportDataOptions = {
  generatedAt?: Date;
  currentUrl?: string | null;
  coverage?: TaxDataCoverage;
};

const copyFrequencyValues = (values: FrequencyValues): FrequencyValues => ({
  year: values.year,
  month: values.month,
  day: values.day,
});

export const sanitizeReportUrl = (url: string | null | undefined) => {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url, REPORT_PRODUCTION_URL);
    const privatePreferenceKeys = ["locale", "theme"];

    privatePreferenceKeys.forEach((key) => parsedUrl.searchParams.delete(key));

    const hashQueryStart = parsedUrl.hash.indexOf("?");
    if (hashQueryStart >= 0) {
      const hashPath = parsedUrl.hash.slice(0, hashQueryStart);
      const hashQuery = parsedUrl.hash.slice(hashQueryStart + 1);
      const hashParams = new URLSearchParams(hashQuery);

      privatePreferenceKeys.forEach((key) => hashParams.delete(key));

      const nextHashQuery = hashParams.toString();
      parsedUrl.hash = nextHashQuery
        ? `${hashPath}?${nextHashQuery}`
        : hashPath;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
};

export const createReportData = (
  store: TaxesStoreSnapshot,
  {
    generatedAt = new Date(),
    currentUrl = null,
    coverage = taxDataCoverage,
  }: CreateReportDataOptions = {},
): ReportData | null => {
  if (
    store.income === null ||
    !Number.isFinite(store.income) ||
    store.income <= 0
  ) {
    return null;
  }

  const irsPay = copyFrequencyValues(store.irsPay);
  const ssPay = copyFrequencyValues(store.ssPay);

  return {
    generatedAt,
    productName: "Freelancer Calculator Portugal",
    titleKey: "report.title",
    productionUrl: REPORT_PRODUCTION_URL,
    currentUrl: sanitizeReportUrl(currentUrl),
    summary: {
      grossIncome: copyFrequencyValues(store.grossIncome),
      netIncome: copyFrequencyValues(store.netIncome),
      totalTaxes: {
        year: irsPay.year + ssPay.year,
        month: irsPay.month + ssPay.month,
        day: irsPay.day + ssPay.day,
      },
      irs: irsPay,
      socialSecurity: ssPay,
      displayFrequency: store.displayFrequency,
    },
    assumptions: {
      taxYear: store.currentTaxRankYear,
      assessmentScenario: store.assessmentScenario,
      incomeFrequency: store.incomeFrequency,
      displayFrequency: store.displayFrequency,
      paidMonths: store.nrMonthsDisplay,
      unpaidDays: store.nrDaysOff,
      dependents: {
        total: store.numberOfDependents,
        aged3OrUnder: store.dependentsAged3OrUnder,
        aged4To6: store.dependentsAged4To6,
        aged7OrOver: store.dependentsAged7OrOver,
      },
      socialSecurityAdjustment: store.ssDiscount,
      socialSecurityFirstYearExemption: store.ssFirstYear,
      firstFiscalYear: store.firstYear,
      secondFiscalYear: store.secondYear,
      youthIrs: {
        active: store.benefitsOfYouthIrs,
        year: store.yearOfYouthIrs,
      },
      rnh: store.rnh,
      expenses: {
        mode: store.expensesAuto ? "automatic" : "manual",
        amount: store.expenses,
        stillNeeded: store.expensesNeeded,
      },
    },
    taxBreakdown: {
      irsBeforeDependentDeduction: store.grossIrsBeforeDependentDeduction,
      dependentDeductionApplied: store.dependentTaxDeductionApplied,
      finalIrs: store.irsPay.year,
      socialSecurityContribution: store.ssPay.year,
      netIncome: store.netIncome.year,
    },
    fiscalData: {
      selectedTaxYear: store.currentTaxRankYear,
      latestSupportedTaxYear: coverage.latestSupportedTaxYear,
      lastReviewedAt: coverage.lastReviewedAt,
      status: getSelectedTaxYearStatus(store.currentTaxRankYear, coverage),
      sourceLabelKeys: coverage.sources.map((source) => source.labelKey),
      estimateDisclaimerKey: "taxData.status.estimateDisclaimer",
    },
  };
};
