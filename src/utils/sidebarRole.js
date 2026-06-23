export function getSidebarRole(pathname = "") {
  if (pathname.startsWith("/provider")) return "provider";
  if (pathname.startsWith("/admin")) return "admin";

  try {
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    const role = user?.role;

    if (role === "service_provider") return "provider";
    if (role === "admin" || role === "provider" || role === "client") {
      return role;
    }
  } catch {
    // Fall back to client navigation when stored user data is unavailable.
  }

  return "client";
}
