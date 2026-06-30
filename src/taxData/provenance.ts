const taxUpdatePolicyUrl = [
  "https://github.com",
  "brunoramosdematos",
  "freelancer-calculator-pt",
  "blob",
  "main",
  "docs",
  "TAX_UPDATE_POLICY.md",
].join("/");

export type TaxDataSourceType =
  | "tax-authority"
  | "social-security"
  | "legislation"
  | "government"
  | "internal-documentation";

export type TaxDataSource = {
  id: string;
  labelKey: string;
  url: string;
  publisherKey: string;
  sourceType: TaxDataSourceType;
};

export type TaxYearProvenanceStatus =
  | "supported"
  | "latest-supported"
  | "historical-supported";

export type TaxYearProvenance = {
  taxYear: number;
  status: TaxYearProvenanceStatus;
  reviewedAt: string;
  implementedInVersion: string;
  sourceIds: readonly string[];
  notesKey?: string;
};

export type TaxDataCoverage = {
  latestSupportedTaxYear: number;
  supportedTaxYears: readonly number[];
  lastReviewedAt: string;
  sources: readonly TaxDataSource[];
  years: readonly TaxYearProvenance[];
};

export type SelectedTaxYearStatusKind =
  | "latest-supported"
  | "historical-supported"
  | "unsupported";

export type SelectedTaxYearStatus = {
  kind: SelectedTaxYearStatusKind;
  severity: "neutral" | "info" | "danger";
  messageKey: string;
  selectedTaxYear: number;
  latestSupportedTaxYear: number;
};

export type FiscalCoverageStatus = {
  kind: "current" | "review-required";
  severity: "neutral" | "warning";
  messageKey: string;
  latestSupportedTaxYear: number;
};

export type TaxDataCoverageValidationIssue = {
  code:
    | "duplicate-source-id"
    | "duplicate-tax-year"
    | "invalid-reviewed-at"
    | "missing-provenance"
    | "non-https-source-url"
    | "unknown-source-id"
    | "unsupported-provenance-year";
  message: string;
};

const sourceReferences = [
  {
    id: "autoridade-tributaria",
    labelKey: "taxData.sources.autoridadeTributaria.label",
    publisherKey: "taxData.sources.autoridadeTributaria.publisher",
    sourceType: "tax-authority",
    url: "https://info.portaldasfinancas.gov.pt/",
  },
  {
    id: "seguranca-social",
    labelKey: "taxData.sources.segurancaSocial.label",
    publisherKey: "taxData.sources.segurancaSocial.publisher",
    sourceType: "social-security",
    url: "https://www.seg-social.pt/",
  },
  {
    id: "diario-republica",
    labelKey: "taxData.sources.diarioRepublica.label",
    publisherKey: "taxData.sources.diarioRepublica.publisher",
    sourceType: "legislation",
    url: "https://diariodarepublica.pt/",
  },
  {
    id: "tax-update-policy",
    labelKey: "taxData.sources.taxUpdatePolicy.label",
    publisherKey: "taxData.sources.taxUpdatePolicy.publisher",
    sourceType: "internal-documentation",
    url: taxUpdatePolicyUrl,
  },
] as const satisfies readonly TaxDataSource[];

const taxYearProvenance = [
  {
    taxYear: 2023,
    status: "historical-supported",
    reviewedAt: "2026-06-30",
    implementedInVersion: "0.5.0",
    sourceIds: [
      "autoridade-tributaria",
      "seguranca-social",
      "diario-republica",
      "tax-update-policy",
    ],
    notesKey: "taxData.notes.conservativeSourceReview",
  },
  {
    taxYear: 2024,
    status: "historical-supported",
    reviewedAt: "2026-06-30",
    implementedInVersion: "0.5.0",
    sourceIds: [
      "autoridade-tributaria",
      "seguranca-social",
      "diario-republica",
      "tax-update-policy",
    ],
    notesKey: "taxData.notes.conservativeSourceReview",
  },
  {
    taxYear: 2025,
    status: "historical-supported",
    reviewedAt: "2026-06-30",
    implementedInVersion: "0.5.0",
    sourceIds: [
      "autoridade-tributaria",
      "seguranca-social",
      "diario-republica",
      "tax-update-policy",
    ],
    notesKey: "taxData.notes.conservativeSourceReview",
  },
  {
    taxYear: 2026,
    status: "latest-supported",
    reviewedAt: "2026-06-30",
    implementedInVersion: "0.5.0",
    sourceIds: [
      "autoridade-tributaria",
      "seguranca-social",
      "diario-republica",
      "tax-update-policy",
    ],
    notesKey: "taxData.notes.conservativeSourceReview",
  },
] as const satisfies readonly TaxYearProvenance[];

const getLastReviewedAt = (years: readonly TaxYearProvenance[]) =>
  [...years]
    .map((year) => year.reviewedAt)
    .sort()
    .at(-1) ?? "";

export const getLatestSupportedTaxYear = (
  coverage: Pick<TaxDataCoverage, "years">,
) => Math.max(...coverage.years.map((year) => year.taxYear));

export const taxDataCoverage = {
  latestSupportedTaxYear: getLatestSupportedTaxYear({
    years: [...taxYearProvenance],
  }),
  supportedTaxYears: [...taxYearProvenance]
    .map((year) => year.taxYear)
    .sort((a, b) => b - a),
  lastReviewedAt: getLastReviewedAt(taxYearProvenance),
  sources: [...sourceReferences],
  years: [...taxYearProvenance],
} as const satisfies TaxDataCoverage;

export const formatLastReviewedDateInput = (reviewedAt: string) => reviewedAt;

export const isIsoDateOnly = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

export const getSelectedTaxYearStatus = (
  selectedTaxYear: number,
  coverage: TaxDataCoverage,
): SelectedTaxYearStatus => {
  if (!coverage.supportedTaxYears.includes(selectedTaxYear)) {
    return {
      kind: "unsupported",
      severity: "danger",
      messageKey: "taxData.status.unsupported",
      selectedTaxYear,
      latestSupportedTaxYear: coverage.latestSupportedTaxYear,
    };
  }

  if (selectedTaxYear === coverage.latestSupportedTaxYear) {
    return {
      kind: "latest-supported",
      severity: "neutral",
      messageKey: "taxData.status.latestSupported",
      selectedTaxYear,
      latestSupportedTaxYear: coverage.latestSupportedTaxYear,
    };
  }

  return {
    kind: "historical-supported",
    severity: "info",
    messageKey: "taxData.status.historicalSupported",
    selectedTaxYear,
    latestSupportedTaxYear: coverage.latestSupportedTaxYear,
  };
};

export const getFiscalCoverageStatus = (
  currentDate: Date,
  coverage: TaxDataCoverage,
): FiscalCoverageStatus => {
  if (currentDate.getUTCFullYear() > coverage.latestSupportedTaxYear) {
    return {
      kind: "review-required",
      severity: "warning",
      messageKey: "taxData.status.reviewRequired",
      latestSupportedTaxYear: coverage.latestSupportedTaxYear,
    };
  }

  return {
    kind: "current",
    severity: "neutral",
    messageKey: "taxData.status.coverageCurrent",
    latestSupportedTaxYear: coverage.latestSupportedTaxYear,
  };
};

export const validateTaxDataCoverage = (
  coverage: TaxDataCoverage,
  supportedTaxYears: readonly number[],
): TaxDataCoverageValidationIssue[] => {
  const issues: TaxDataCoverageValidationIssue[] = [];
  const supportedYearSet = new Set(supportedTaxYears);
  const sourceIds = new Set<string>();
  const yearSet = new Set<number>();

  coverage.sources.forEach((source) => {
    if (sourceIds.has(source.id)) {
      issues.push({
        code: "duplicate-source-id",
        message: `Duplicate source id: ${source.id}`,
      });
    }
    sourceIds.add(source.id);

    if (!source.url.startsWith("https://")) {
      issues.push({
        code: "non-https-source-url",
        message: `Source URL must use HTTPS: ${source.id}`,
      });
    }
  });

  coverage.years.forEach((year) => {
    if (yearSet.has(year.taxYear)) {
      issues.push({
        code: "duplicate-tax-year",
        message: `Duplicate tax year provenance: ${year.taxYear}`,
      });
    }
    yearSet.add(year.taxYear);

    if (!supportedYearSet.has(year.taxYear)) {
      issues.push({
        code: "unsupported-provenance-year",
        message: `Provenance exists for unsupported year: ${year.taxYear}`,
      });
    }

    if (!isIsoDateOnly(year.reviewedAt)) {
      issues.push({
        code: "invalid-reviewed-at",
        message: `Invalid reviewedAt date for ${year.taxYear}: ${year.reviewedAt}`,
      });
    }

    year.sourceIds.forEach((sourceId) => {
      if (!sourceIds.has(sourceId)) {
        issues.push({
          code: "unknown-source-id",
          message: `Unknown source id for ${year.taxYear}: ${sourceId}`,
        });
      }
    });
  });

  supportedTaxYears.forEach((taxYear) => {
    if (!yearSet.has(taxYear)) {
      issues.push({
        code: "missing-provenance",
        message: `Missing provenance for supported tax year: ${taxYear}`,
      });
    }
  });

  return issues;
};
