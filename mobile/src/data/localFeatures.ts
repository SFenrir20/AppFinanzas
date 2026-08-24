import { colors } from "../design/tokens";

export const budgetCategories = [
  { name: "Alimentacion", spent: 720, limit: 900, color: colors.accent },
  { name: "Transporte", spent: 350, limit: 600, color: colors.accent },
  { name: "Vivienda", spent: 1000, limit: 1000, color: colors.warning },
  { name: "Entretenimiento", spent: 280, limit: 300, color: colors.warning },
];

export const goals = [
  {
    name: "MacBook nueva",
    targetDate: "Dic 2026",
    saved: 3200,
    target: 6000,
    color: colors.primary,
  },
  {
    name: "Viaje a Europa",
    targetDate: "Jul 2027",
    saved: 1500,
    target: 4000,
    color: colors.primarySoft,
  },
  {
    name: "Fondo de emergencia",
    targetDate: "Mar 2027",
    saved: 2800,
    target: 5000,
    color: colors.accent,
  },
];

export const categoryColors: Record<string, string> = {
  Alimentacion: colors.accent,
  Food: colors.accent,
  Transporte: colors.primarySoft,
  Vivienda: colors.primary,
  Entretenimiento: colors.warning,
  Otros: "#87989D",
  Salud: "#8DCACB",
};
