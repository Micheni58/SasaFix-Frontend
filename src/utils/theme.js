const THEME_STORAGE_PREFIX = "sasafix-theme-user-";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getUserThemeKey(user = getStoredUser()) {
  const identity = user?.id ?? user?.user_id ?? user?.email?.toLowerCase() ?? user?.role;
  return identity ? `${THEME_STORAGE_PREFIX}${identity}` : null;
}

export function getThemePreference(user = getStoredUser()) {
  const themeKey = getUserThemeKey(user);
  if (!themeKey) return "light";

  try {
    return localStorage.getItem(themeKey) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme, user = getStoredUser()) {
  const nextTheme = theme === "dark" ? "dark" : "light";

  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;

  const themeKey = getUserThemeKey(user);
  if (!themeKey) return;

  try {
    localStorage.setItem(themeKey, nextTheme);
  } catch {
    // Keep the theme active for this session if storage is unavailable.
  }
}

export function syncThemeWithRoute(pathname) {
  const user = getStoredUser();
  const hasSession = Boolean(localStorage.getItem("access_token") && user);
  const isUserPage = /^\/(client|provider|admin)(\/|$)/.test(pathname) || pathname === "/profile";

  // Public pages and signed-out sessions always remain light; saved preference is retained.
  const theme = hasSession && isUserPage ? getThemePreference(user) : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}