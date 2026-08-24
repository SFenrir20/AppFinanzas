export function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatPEN(value: string | number | null | undefined, compact = false): string {
  const amount = toNumber(value);
  const formatted = new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(amount);
  return `S/ ${formatted}`;
}
