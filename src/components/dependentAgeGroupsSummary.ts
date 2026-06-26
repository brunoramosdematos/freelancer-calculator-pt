export interface DependentAgeGroupsSummarySegment {
  key: string;
  values: Record<string, number>;
  plural: number;
}

export interface DependentAgeGroupsSummaryDescriptor {
  key: string;
  values?: Record<string, number>;
  plural?: number;
  segments?: DependentAgeGroupsSummarySegment[];
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
    segments: [
      {
        key: "dependents.summary.aged3OrUnderSegment",
        values: { count: aged3OrUnder },
        plural: aged3OrUnder,
      },
      {
        key: "dependents.summary.aged4To6Segment",
        values: { count: aged4To6 },
        plural: aged4To6,
      },
      {
        key: "dependents.summary.aged7OrOverSegment",
        values: { count: aged7OrOver },
        plural: aged7OrOver,
      },
    ],
  };
};
