export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ca-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
