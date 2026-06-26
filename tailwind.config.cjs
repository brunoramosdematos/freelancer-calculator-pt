const withOpacity = (variableName) => {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variableName}) / 1)`;
    }

    return `rgb(var(${variableName}) / ${opacityValue})`;
  };
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: withOpacity("--color-page"),
        surface: withOpacity("--color-surface"),
        "surface-elevated": withOpacity("--color-surface-elevated"),
        "surface-muted": withOpacity("--color-surface-muted"),
        "surface-hover": withOpacity("--color-surface-hover"),
        foreground: withOpacity("--color-text"),
        muted: withOpacity("--color-text-muted"),
        subtle: withOpacity("--color-text-subtle"),
        primary: withOpacity("--color-primary"),
        "primary-soft": withOpacity("--color-primary-soft"),
        focus: withOpacity("--color-focus"),
        income: withOpacity("--color-income"),
        "income-soft": withOpacity("--color-income-soft"),
        irs: withOpacity("--color-irs"),
        "irs-soft": withOpacity("--color-irs-soft"),
        "social-security": withOpacity("--color-social-security"),
        "social-security-soft": withOpacity("--color-social-security-soft"),
        warning: withOpacity("--color-warning"),
        "warning-soft": withOpacity("--color-warning-soft"),
        danger: withOpacity("--color-danger"),
        overlay: withOpacity("--color-overlay"),
        "chart-label": withOpacity("--color-chart-label"),
        "chart-tooltip": withOpacity("--color-chart-tooltip"),
        "chart-tooltip-text": withOpacity("--color-chart-tooltip-text"),
        secondary: withOpacity("--color-primary-soft"),
        tertiary: withOpacity("--color-warning"),
        defaultbg: withOpacity("--color-page"),
      },
    },
    fontFamily: {
      sans: ["Montserrat"],
    },
  },
  plugins: [],
};
