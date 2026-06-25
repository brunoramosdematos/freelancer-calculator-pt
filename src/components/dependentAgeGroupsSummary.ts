export interface DependentAgeGroupsSummaryDescriptor {
  key: string;
  values?: Record<string, number>;
  plural?: number;
}

export const getDependentAgeGroupsSummaryDescriptor = (
  total: number,
  aged3OrUnder: number,
  aged4To6: number,
): DependentAgeGroupsSummaryDescriptor => {
  if (total <= 0) {
    return { key: "dependents.summary.none" };
  }

  const aged7OrOver = Math.max(total - aged3OrUnder - aged4To6, 0);

  if (aged3OrUnder === 0 && aged4To6 === 0) {
    return {
      key: "dependents.summary.allOlder",
      values: { total },
      plural: total,
    };
  }

  return {
    key: "dependents.summary.mixed",
    values: {
      aged3OrUnder,
      aged4To6,
      aged7OrOver,
    },
  };
};
