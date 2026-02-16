export function getRamadanDates(year: number = 2026) {
  const startDate = new Date(year, 1, 19);
  const dates: Date[] = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }

  return dates;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });
}
