import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyResolvedTheme,
  DEFAULT_THEME_PREFERENCE,
  isThemePreference,
  persistThemePreference,
  readStoredThemePreference,
  resolveThemePreference,
  THEME_STORAGE_KEY,
} from "@/theme";
import {
  resetThemeControllerForTests,
  setThemePreference,
  startThemeController,
  useTheme,
} from "@/composables/useTheme";

const originalLocalStorage = window.localStorage;
const originalMatchMedia = window.matchMedia;

const makeStorage = (initialValue: string | null = null) => {
  let storedValue = initialValue;

  return {
    getItem: vi.fn(() => storedValue),
    setItem: vi.fn((_key: string, value: string) => {
      storedValue = value;
    }),
  } as unknown as Storage;
};

const installMatchMedia = (matches: boolean) => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    matches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn((_event: "change", listener) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    }),
    removeEventListener: vi.fn((_event: "change", listener) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    }),
    dispatch(nextMatches: boolean) {
      this.matches = nextMatches;
      listeners.forEach((listener) =>
        listener({ matches: nextMatches } as MediaQueryListEvent),
      );
    },
  };

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => mediaQuery),
  });

  return mediaQuery;
};

const installLegacyMatchMedia = (matches: boolean) => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    matches,
    media: "(prefers-color-scheme: dark)",
    addListener: vi.fn((listener) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    }),
    removeListener: vi.fn((listener) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    }),
    dispatch(nextMatches: boolean) {
      this.matches = nextMatches;
      listeners.forEach((listener) =>
        listener({ matches: nextMatches } as MediaQueryListEvent),
      );
    },
  };

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => mediaQuery),
  });

  return mediaQuery;
};

describe("theme preference helpers", () => {
  afterEach(() => {
    resetThemeControllerForTests();
    vi.restoreAllMocks();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "";
    document.head.innerHTML = "";
  });

  it("validates supported preferences and rejects malformed values", () => {
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("automatic")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });

  it("reads a valid stored preference or falls back to System", () => {
    expect(readStoredThemePreference(makeStorage("dark"))).toBe("dark");
    expect(readStoredThemePreference(makeStorage("unexpected"))).toBe(
      DEFAULT_THEME_PREFERENCE,
    );
    expect(readStoredThemePreference(makeStorage(null))).toBe(
      DEFAULT_THEME_PREFERENCE,
    );
  });

  it("ignores storage read and write exceptions", () => {
    const throwingStorage = {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      setItem: vi.fn(() => {
        throw new Error("blocked");
      }),
    } as unknown as Storage;

    expect(readStoredThemePreference(throwingStorage)).toBe("system");
    expect(persistThemePreference("dark", throwingStorage)).toBe(false);
  });

  it("persists explicit System, Light and Dark preferences", () => {
    const storage = makeStorage();

    expect(persistThemePreference("system", storage)).toBe(true);
    expect(storage.setItem).toHaveBeenLastCalledWith(
      THEME_STORAGE_KEY,
      "system",
    );

    expect(persistThemePreference("light", storage)).toBe(true);
    expect(storage.setItem).toHaveBeenLastCalledWith(
      THEME_STORAGE_KEY,
      "light",
    );

    expect(persistThemePreference("dark", storage)).toBe(true);
    expect(storage.setItem).toHaveBeenLastCalledWith(THEME_STORAGE_KEY, "dark");
  });

  it("resolves System from the media query and explicit preferences directly", () => {
    expect(resolveThemePreference("system", false)).toBe("light");
    expect(resolveThemePreference("system", true)).toBe("dark");
    expect(resolveThemePreference("light", true)).toBe("light");
    expect(resolveThemePreference("dark", false)).toBe("dark");
  });

  it("falls back to Light when matchMedia is unavailable", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined,
    });

    expect(resolveThemePreference("system")).toBe("light");
  });

  it("applies the resolved theme to document attributes and theme-color", () => {
    document.head.innerHTML = '<meta name="theme-color" content="#f5f5f5" />';

    applyResolvedTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
        ?.content,
    ).toBe("#0b1220");

    applyResolvedTheme("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
        ?.content,
    ).toBe("#f5f5f5");
  });
});

describe("theme controller", () => {
  afterEach(() => {
    resetThemeControllerForTests();
    vi.restoreAllMocks();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "";
    document.head.innerHTML = "";
  });

  it("responds to system media changes only while System is selected", () => {
    const mediaQuery = installMatchMedia(false);
    const { resolvedTheme, preference } = useTheme();

    startThemeController();
    expect(preference.value).toBe("system");
    expect(resolvedTheme.value).toBe("light");

    mediaQuery.dispatch(true);
    expect(resolvedTheme.value).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    mediaQuery.dispatch(false);
    expect(resolvedTheme.value).toBe("light");

    setThemePreference("light");
    mediaQuery.dispatch(true);
    expect(preference.value).toBe("light");
    expect(resolvedTheme.value).toBe("light");

    setThemePreference("dark");
    mediaQuery.dispatch(false);
    expect(preference.value).toBe("dark");
    expect(resolvedTheme.value).toBe("dark");
  });

  it("supports the legacy addListener media query API", () => {
    const mediaQuery = installLegacyMatchMedia(false);
    const { resolvedTheme } = useTheme();

    setThemePreference("system");
    startThemeController();

    mediaQuery.dispatch(true);
    expect(resolvedTheme.value).toBe("dark");
    expect(mediaQuery.addListener).toHaveBeenCalled();

    setThemePreference("light");
    expect(mediaQuery.removeListener).toHaveBeenCalled();
  });

  it("keeps the in-memory preference when storage writes fail", () => {
    installMatchMedia(false);
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => {
          throw new Error("blocked");
        }),
      },
    });

    const { preference, resolvedTheme } = useTheme();
    startThemeController();

    expect(setThemePreference("dark")).toBe(true);
    expect(preference.value).toBe("dark");
    expect(resolvedTheme.value).toBe("dark");
  });
});
