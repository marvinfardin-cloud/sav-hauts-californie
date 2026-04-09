import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy", { locale: fr });
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy 'à' HH:mm", { locale: fr });
}

export function formatDateLong(date: Date | string): string {
  return format(new Date(date), "EEEE d MMMM yyyy", { locale: fr });
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), "HH:mm", { locale: fr });
}

// Generate ticket number: SAV-YYYY-XXXX
export function generateTicketNumber(count: number): string {
  const year = new Date().getFullYear();
  const num = String(count + 1).padStart(4, "0");
  return `SAV-${year}-${num}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
