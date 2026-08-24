import { Funnel, Search } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { listExpenses } from "../api/finance";
import { Expense } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { SegmentedControl } from "../components/SegmentedControl";
import { colors, radii } from "../design/tokens";
import { formatPEN, toNumber } from "../utils/money";

type Period = "week" | "month" | "year";

const periods = [
  { label: "Semana", value: "week" as Period },
  { label: "Mes", value: "month" as Period },
  { label: "Ano", value: "year" as Period },
];

export function MovementsScreen() {
  const { token } = useAuth();
  const [period, setPeriod] = useState<Period>("month");
  const [query, setQuery] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listExpenses(token)
      .then((items) => {
        setExpenses(items);
        setError(null);
      })
      .catch(() => setError("No se pudieron cargar los movimientos."));
  }, [token]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return expenses;
    return expenses.filter(
      (expense) =>
        expense.description.toLowerCase().includes(needle) ||
        expense.category.toLowerCase().includes(needle),
    );
  }, [expenses, query]);

  const total = visible.reduce((sum, expense) => sum + toNumber(expense.amount), 0);
  const cardTotal = visible
    .filter((expense) => expense.source === "card")
    .reduce((sum, expense) => sum + toNumber(expense.amount), 0);
  const accountTotal = total - cardTotal;
  const grouped = groupByDate(visible);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Movimientos</Text>
        <View style={styles.iconButton}>
          <Funnel color={colors.primary} size={20} />
        </View>
      </View>
      <SegmentedControl options={periods} value={period} onChange={setPeriod} />
      <View style={styles.searchBox}>
        <Search color={colors.muted} size={18} />
        <TextInput
          placeholder="Buscar movimientos"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.summaryGrid}>
        <SummaryTile label="Total" value={formatPEN(total, true)} />
        <SummaryTile label="Cuenta" value={formatPEN(accountTotal, true)} />
        <SummaryTile label="Tarjeta" value={formatPEN(cardTotal, true)} />
      </View>
      {error && <Text style={styles.notice}>{error}</Text>}
      <Card style={styles.listCard}>
        {grouped.length === 0 ? (
          <Text style={styles.empty}>Todavia no hay movimientos registrados.</Text>
        ) : (
          grouped.map((section) => (
            <View key={section.date} style={styles.section}>
              <Text style={styles.dateLabel}>{section.date}</Text>
              {section.items.map((expense) => (
                <View key={expense.id} style={styles.row}>
                  <View style={styles.categoryIcon}>
                    <Text style={styles.categoryInitial}>{expense.category.slice(0, 1).toUpperCase()}</Text>
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{expense.description}</Text>
                    <Text style={styles.rowMeta}>{expense.category} - {expense.source === "card" ? "Tarjeta" : "Cuenta"}</Text>
                  </View>
                  <Text style={styles.amount}>-{formatPEN(expense.amount, true)}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function groupByDate(items: Expense[]) {
  const sections = new Map<string, Expense[]>();
  items.forEach((item) => {
    const date = new Date(item.spent_at).toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
    });
    sections.set(date, [...(sections.get(date) ?? []), item]);
  });
  return Array.from(sections.entries()).map(([date, sectionItems]) => ({ date, items: sectionItems }));
}

const styles = StyleSheet.create({
  amount: { color: colors.danger, fontSize: 14, fontWeight: "900" },
  categoryIcon: { alignItems: "center", backgroundColor: colors.surfaceMuted, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  categoryInitial: { color: colors.primary, fontWeight: "900" },
  dateLabel: { color: colors.muted, fontSize: 13, fontWeight: "800", marginBottom: 4, marginTop: 12 },
  empty: { color: colors.muted, fontSize: 14, paddingVertical: 18, textAlign: "center" },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingTop: 14, marginBottom: 18 },
  iconButton: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  listCard: { marginTop: 18 },
  notice: { color: colors.warning, fontSize: 12, marginTop: 12 },
  row: { alignItems: "center", borderTopColor: colors.line, borderTopWidth: 1, flexDirection: "row", gap: 12, paddingVertical: 14 },
  rowMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  rowText: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  searchBox: { alignItems: "center", backgroundColor: colors.surface, borderRadius: radii.md, flexDirection: "row", gap: 8, marginTop: 16, paddingHorizontal: 14 },
  searchInput: { color: colors.text, flex: 1, minHeight: 48 },
  section: { gap: 2 },
  summaryGrid: { flexDirection: "row", gap: 8, marginTop: 16 },
  summaryLabel: { color: colors.muted, fontSize: 12 },
  summaryTile: { backgroundColor: colors.surface, borderRadius: radii.md, flex: 1, padding: 12 },
  summaryValue: { color: colors.primary, fontSize: 15, fontWeight: "900", marginTop: 4 },
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
});
