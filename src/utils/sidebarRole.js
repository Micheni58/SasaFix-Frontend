export function getSidebarRole(pathname = "") {
  if (pathname.startsWith("/provider")) return "provider";
  if (pathname.startsWith("/admin")) return "admin";

  const storedRole = getStoredUserRole();
  return storedRole || "client";
}

export function getStoredUserRole() {
  try {
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    const role = user?.role;

    if (role === "service_provider") return "provider";
    if (role === "admin" || role === "provider" || role === "client") {
      return role;
    }
  } catch {
    return null;
  }

  return null;
}

export function getStoredProviderId() {
  try {
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    const providerId =
      user?.provider_id ??
      user?.service_provider_id ??
      localStorage.getItem("providerId") ??
      localStorage.getItem("serviceProviderId");

    return providerId ? Number(providerId) || null : null;
  } catch {
    return null;
  }
}
