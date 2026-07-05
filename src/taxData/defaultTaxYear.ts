import { taxDataCoverage } from "@/taxData/provenance";

export type DefaultTaxYearOptions = {
  currentDate: Date;
  supportedTaxYears: readonly number[];
};

export const getDefaultTaxYear = ({
  currentDate,
  supportedTaxYears,
}: DefaultTaxYearOptions): number => {
  if (supportedTaxYears.length === 0) {
    throw new Error(
      "Cannot determine default tax year without supported years.",
    );
  }

  const sortedSupportedYears = [...supportedTaxYears].sort((a, b) => a - b);
  const earliestSupportedYear = sortedSupportedYears[0];
  const latestSupportedYear =
    sortedSupportedYears[sortedSupportedYears.length - 1];
  const currentYear = currentDate.getFullYear();

  if (sortedSupportedYears.includes(currentYear)) {
    return currentYear;
  }

  if (currentYear < earliestSupportedYear) {
    return earliestSupportedYear;
  }

  return latestSupportedYear;
};

export const getRuntimeDefaultTaxYear = (): number =>
  getDefaultTaxYear({
    currentDate: new Date(),
    supportedTaxYears: taxDataCoverage.supportedTaxYears,
  });
