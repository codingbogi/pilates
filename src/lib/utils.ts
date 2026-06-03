export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(locale === "sr" ? "sr-Latn-RS" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getNext7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    days.push(`${yyyy}-${mm}-${dd}`);
  }
  return days;
}

export function isSunday(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay() === 0;
}

export function canCancel(dateStr: string, timeSlot: string): boolean {
  const slotDate = new Date(`${dateStr}T${timeSlot}:00`);
  const now = new Date();
  const diff = slotDate.getTime() - now.getTime();
  return diff >= 12 * 60 * 60 * 1000; // 12 hours in ms
}
