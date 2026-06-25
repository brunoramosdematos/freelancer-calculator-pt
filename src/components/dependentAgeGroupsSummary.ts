export const formatDependentAgeGroupsSummary = (
  total: number,
  aged3OrUnder: number,
  aged4To6: number,
) => {
  if (total <= 0) {
    return "No dependents.";
  }

  const aged7OrOver = Math.max(total - aged3OrUnder - aged4To6, 0);

  if (aged3OrUnder === 0 && aged4To6 === 0) {
    return total === 1
      ? "The dependent is currently treated as aged 7+."
      : `All ${total} dependents are currently treated as aged 7+.`;
  }

  return `${aged3OrUnder} aged 3 or under · ${aged4To6} aged 4–6 · ${aged7OrOver} aged 7+`;
};
