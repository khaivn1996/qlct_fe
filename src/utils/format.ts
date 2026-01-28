import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  isAfter,
  parseISO,
} from "date-fns";
import { vi } from "date-fns/locale";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy", { locale: vi });
}

export function formatDateFull(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEEE, dd/MM/yyyy", { locale: vi });
}

export function formatMonth(date: Date): string {
  return format(date, "yyyy-MM");
}

export function formatMonthDisplay(date: Date): string {
  return format(date, "MMMM yyyy", { locale: vi });
}

export function getMonthRange(date: Date): { from: string; to: string } {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return {
    from: format(start, "yyyy-MM-dd"),
    to: format(end, "yyyy-MM-dd"),
  };
}

export function getPreviousMonth(date: Date): Date {
  return subMonths(date, 1);
}

export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

export function isFutureDate(date: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isAfter(d, new Date());
}

export function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseInt(amount, 10) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(amount: string | number): string {
  const num = typeof amount === "string" ? parseInt(amount, 10) : amount;
  return new Intl.NumberFormat("vi-VN").format(num);
}
