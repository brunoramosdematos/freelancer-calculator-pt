export const DEPENDENT_BASE_DEDUCTION = 600;
export const FIRST_YOUNG_DEPENDENT_SUPPLEMENT = 126;
export const ADDITIONAL_YOUNG_DEPENDENT_SUPPLEMENT = 300;

export const calculateDependentTaxDeduction = (
  total: number,
  dependentsAged3OrUnder: number,
  dependentsAged4To6: number,
) => {
  const young = dependentsAged3OrUnder;
  const middle = dependentsAged4To6;
  const older = total - young - middle;
  const base = DEPENDENT_BASE_DEDUCTION * total;

  if (total === 0) {
    return 0;
  }

  if (older > 0) {
    return base + ADDITIONAL_YOUNG_DEPENDENT_SUPPLEMENT * (young + middle);
  }

  if (middle > 0) {
    return base + ADDITIONAL_YOUNG_DEPENDENT_SUPPLEMENT * (total - 1);
  }

  return (
    base +
    FIRST_YOUNG_DEPENDENT_SUPPLEMENT +
    ADDITIONAL_YOUNG_DEPENDENT_SUPPLEMENT * (total - 1)
  );
};
