export enum FrequencyChoices {
  Year = "year",
  Month = "month",
  Day = "day",
}

export enum AssessmentScenario {
  Individual = "individual",
  JointSingleIncome = "joint-single-income",
  JointTwoIncomes = "joint-two-incomes",
}

export interface GrossIncome {
  year: number;
  month: number;
  day: number;
}

export interface TaxRank {
  id: number;
  min: number;
  max: number | null;
  normalTax: number;
  averageTax: number | null;
}

export interface YouthIrsRank {
  maxDiscountPercentage: number;
  maxDiscountIasMultiplier: number;
}

export interface YouthIrs {
  [key: number]: YouthIrsRank;
}
