export function formatMemberSince(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const hasTime = typeof value === "string" && /[T ]\d{1,2}:\d{2}/.test(value);
  return new Intl.DateTimeFormat(
    "en-KE",
    hasTime
      ? { dateStyle: "medium", timeStyle: "short", hour12: true }
      : { dateStyle: "medium" },
  ).format(date);
}
