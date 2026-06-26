import { readonly, ref } from "vue";
import {
  applyResolvedTheme,
  getThemeMediaQuery,
  isThemePreference,
  persistThemePreference,
  readStoredThemePreference,
  resolveThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "@/theme";

type ThemeListenerCleanup = () => void;

const preference = ref<ThemePreference>(readStoredThemePreference());
const resolvedTheme = ref<ResolvedTheme>(
  resolveThemePreference(preference.value),
);
let cleanupSystemListener: ThemeListenerCleanup | null = null;
let initialized = false;

const syncDocumentTheme = () => {
  const nextResolvedTheme = resolveThemePreference(preference.value);
  resolvedTheme.value = nextResolvedTheme;
  applyResolvedTheme(nextResolvedTheme);
};

const unsubscribeSystemListener = () => {
  cleanupSystemListener?.();
  cleanupSystemListener = null;
};

const subscribeToSystemPreference = () => {
  unsubscribeSystemListener();

  if (preference.value !== "system") {
    return;
  }

  const mediaQuery = getThemeMediaQuery();
  if (!mediaQuery) {
    return;
  }

  const handleChange = () => {
    if (preference.value === "system") {
      syncDocumentTheme();
    }
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);
    cleanupSystemListener = () =>
      mediaQuery.removeEventListener("change", handleChange);
    return;
  }

  const legacyMediaQuery = mediaQuery as MediaQueryList & {
    addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  };

  legacyMediaQuery.addListener?.(handleChange);
  cleanupSystemListener = () => legacyMediaQuery.removeListener?.(handleChange);
};

export const startThemeController = () => {
  if (!initialized) {
    preference.value = readStoredThemePreference();
    syncDocumentTheme();
    subscribeToSystemPreference();
    initialized = true;
  }

  return {
    stop: () => {
      unsubscribeSystemListener();
      initialized = false;
    },
  };
};

export const setThemePreference = (nextPreference: ThemePreference) => {
  if (!isThemePreference(nextPreference)) {
    return false;
  }

  preference.value = nextPreference;
  persistThemePreference(nextPreference);
  syncDocumentTheme();
  subscribeToSystemPreference();
  return true;
};

export const useTheme = () => ({
  preference: readonly(preference),
  resolvedTheme: readonly(resolvedTheme),
  setThemePreference,
});

export const resetThemeControllerForTests = () => {
  unsubscribeSystemListener();
  preference.value = readStoredThemePreference();
  resolvedTheme.value = resolveThemePreference(preference.value);
  initialized = false;
};
