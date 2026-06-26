export const THEME_PREFERENCES = ["system", "light", "dark"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "freelancer-calculator-pt:theme:v1";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";
export const LIGHT_THEME_COLOR = "#f5f5f5";
export const DARK_THEME_COLOR = "#0b1220";
export const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

export const isThemePreference = (value: unknown): value is ThemePreference =>
  typeof value === "string" &&
  (THEME_PREFERENCES as readonly string[]).includes(value);

export const readStoredThemePreference = (
  storage: Storage | undefined = getStorage(),
): ThemePreference => {
  try {
    const storedPreference = storage?.getItem(THEME_STORAGE_KEY);
    return isThemePreference(storedPreference)
      ? storedPreference
      : DEFAULT_THEME_PREFERENCE;
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
};

export const persistThemePreference = (
  preference: ThemePreference,
  storage: Storage | undefined = getStorage(),
): boolean => {
  if (!isThemePreference(preference)) {
    return false;
  }

  try {
    storage?.setItem(THEME_STORAGE_KEY, preference);
    return true;
  } catch {
    return false;
  }
};

export const resolveThemePreference = (
  preference: ThemePreference,
  matchesDark = getSystemPrefersDark(),
): ResolvedTheme => {
  if (preference === "light" || preference === "dark") {
    return preference;
  }

  return matchesDark ? "dark" : "light";
};

export const applyResolvedTheme = (
  resolvedTheme: ResolvedTheme,
  documentRef: Document | undefined = getDocument(),
) => {
  if (!documentRef) {
    return;
  }

  const root = documentRef.documentElement;
  const isDark = resolvedTheme === "dark";
  root.dataset.theme = resolvedTheme;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = resolvedTheme;

  const themeColor =
    resolvedTheme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
  const existingMeta = documentRef.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  const metaThemeColor = existingMeta ?? documentRef.createElement("meta");
  metaThemeColor.name = "theme-color";
  metaThemeColor.content = themeColor;

  if (!existingMeta) {
    documentRef.head.appendChild(metaThemeColor);
  }
};

export const getSystemPrefersDark = (
  windowRef: Window | undefined = getWindow(),
): boolean => {
  try {
    return Boolean(windowRef?.matchMedia?.(PREFERS_DARK_QUERY).matches);
  } catch {
    return false;
  }
};

export const getThemeMediaQuery = (
  windowRef: Window | undefined = getWindow(),
) => {
  try {
    return windowRef?.matchMedia?.(PREFERS_DARK_QUERY) ?? null;
  } catch {
    return null;
  }
};

const getWindow = () => (typeof window === "undefined" ? undefined : window);

const getDocument = () =>
  typeof document === "undefined" ? undefined : document;

const getStorage = () => getWindow()?.localStorage;
