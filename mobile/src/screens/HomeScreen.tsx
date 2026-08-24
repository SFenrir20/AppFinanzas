import { Bell, Eye, WalletCards } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth/AuthContext";
import { Card } from "../components/Card";
import { DonutChart } from "../components/DonutChart";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { StatusPill } from "../components/StatusPill";
import { getSummary, listExpenses } from "../api/finance";
import { Expense, FinancialSummary } from "../api/types";
import { categoryColors } from "../data/localFeatures";
import { colors } from "../design/tokens";
import { formatPEN, toNumber } from "../utils/money";

type Props = {
  onViewMovements: () => void;
};

export function HomeScreen({ onViewMovements }: Props) {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([getSummary(token), listExpenses(token)])
      .then(([nextSummary, nextExpenses]) => {
        setSummary(nextSummary);
        setExpenses(nextExpenses.slice(0, 3));
        setError(null);
      })
      .catch(() => setError("No se pudo cargar la API. Mostrando estado seguro."));
  }, [token]);

  const categorySegments = useMemo(
    () =>
      (summary?.categories ?? []).map((item) => ({
        value: toNumber(item.amount),
        color: categoryColors[item.category] ?? colors.primarySoft,
      })),
    [summary],
  );

  const spent = toNumber(summary?.monthly_expense);
  const monthlyTarget = Math.max(4000, spent);
  const percentage = monthlyTarget ? Math.round((spent / monthlyTarget) * 100) : 0;
  const balance = toNumber(summary?.total_bank_balance);
  const available = Math.max(0, monthlyTarget - spent);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.email.split("@")[0] ?? "Santiago"}</Text>
          <Text style={styles.subcopy}>Este es tu resumen financiero</Text>
        </View>
        <View style={styles.headerActions}>
          <Bell color={colors.ink} size={22} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.email[0]?.toUpperCase() ?? "S"}</Text>
          </View>
        </View>
      </View>
      {error && <Text style={styles.notice}>{error}</Text>}
      <Card dark style={styles.balanceCard}>
        <View style={styles.balanceTop}>
          <Text style={styles.balanceLabel}>Balance disponible</Text>
          <Eye color={colors.accent} size={18} />
        </View>
        <Text style={styles.balanceAmount}>{formatPEN(balance || summary?.credit_available || 0)}</Text>
        <StatusPill>+12.5% este mes</StatusPill>
        <View style={styles.balanceDivider} />
        <View style={styles.balanceGrid}>
          <View>
            <Text style={styles.miniLabel}>Ingresos</Text>
            <Text style={styles.income}>{formatPEN(user?.profile.monthly_salary ?? 0, true)}</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View>
            <Text style={styles.miniLabel}>Gastos</Text>
            <Text style={styles.expense}>{formatPEN(spent, true)}</Text>
          </View>
        </View>
      </Card>
      <Card style={styles.monthCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.sectionTitle}>Gastaste este mes</Text>
            <Text style={styles.spent}>{formatPEN(spent, true)} <Text style={styles.of}>de {formatPEN(monthlyTarget, true)}</Text></Text>
          </View>
          <View style={styles.circlePercent}>
            <Text style={styles.circleText}>{percentage}%</Text>
          </View>
        </View>
        <ProgressBar value={percentage} />
        <Text style={styles.available}>Quedan {formatPEN(available, true)} disponibles</Text>
      </Card>
      <Card style={styles.categoryCard}>
        <Text style={styles.sectionTitle}>En que estas gastando</Text>
        <View style={styles.categoryBody}>
          <DonutChart total={formatPEN(spent, true)} segments={categorySegments.length ? categorySegments : [{ value: 1, color: colors.faint }]} />
          <View style={styles.legend}>
            {(summary?.categories ?? []).slice(0, 6).map((item) => (
              <View key={item.category} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: categoryColors[item.category] ?? colors.primarySoft }]} />
                <Text style={styles.legendName}>{item.category}</Text>
                <Text style={styles.legendValue}>{formatPEN(item.amount, true)}</Text>
              </View>
            ))}
            {summary?.categories.length === 0 && <Text style={styles.emptyText}>Aun no hay categorias.</Text>}
          </View>
        </View>
      </Card>
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Ultimos movimientos</Text>
          <Pressable onPress={onViewMovements}>
            <Text style={styles.link}>Ver todos</Text>
          </Pressable>
        </View>
        {expenses.length === 0 ? (
          <View style={styles.emptyMovement}>
            <WalletCards color={colors.accent} size={22} />
            <Text style={styles.emptyText}>Registra tu primer movimiento.</Text>
          </View>
        ) : (
          expenses.map((expense) => (
            <View key={expense.id} style={styles.movementRow}>
              <Text style={styles.movementName}>{expense.description}</Text>
              <Text style={styles.movementAmount}>{formatPEN(expense.amount)}</Text>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  available: { color: colors.muted, fontSize: 13, marginTop: 10 },
  avatar: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  avatarText: { color: colors.surface, fontWeight: "900" },
  balanceAmount: { color: colors.surface, fontSize: 32, fontWeight: "900", marginVertical: 6 },
  balanceCard: { gap: 10 },
  balanceDivider: { backgroundColor: colors.primarySoft, height: 1, marginVertical: 4 },
  balanceGrid: { alignItems: "center", flexDirection: "row", justifyContent: "space-around" },
  balanceLabel: { color: colors.surface, fontSize: 13 },
  balanceTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  categoryBody: { alignItems: "center", flexDirection: "row", gap: 16, marginTop: 18 },
  categoryCard: { marginTop: 18 },
  circlePercent: { alignItems: "center", backgroundColor: colors.surfaceMuted, borderRadius: 28, height: 56, justifyContent: "center", width: 56 },
  circleText: { color: colors.warning, fontSize: 13, fontWeight: "900" },
  emptyMovement: { alignItems: "center", flexDirection: "row", gap: 10, paddingTop: 16 },
  emptyText: { color: colors.muted, fontSize: 13 },
  expense: { color: colors.warning, fontSize: 18, fontWeight: "900" },
  greeting: { color: colors.primary, fontSize: 15 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 16, paddingTop: 14 },
  headerActions: { alignItems: "center", flexDirection: "row", gap: 14 },
  income: { color: colors.accent, fontSize: 18, fontWeight: "900" },
  legend: { flex: 1, gap: 8 },
  legendDot: { borderRadius: 4, height: 8, width: 8 },
  legendName: { color: colors.muted, flex: 1, fontSize: 13 },
  legendRow: { alignItems: "center", flexDirection: "row", gap: 7 },
  legendValue: { color: colors.text, fontSize: 12, fontWeight: "800" },
  link: { color: colors.success, fontSize: 13, fontWeight: "700" },
  miniLabel: { color: colors.surface, fontSize: 13 },
  monthCard: { gap: 12, marginTop: 16 },
  movementAmount: { color: colors.text, fontWeight: "900" },
  movementName: { color: colors.text, flex: 1, fontWeight: "800" },
  movementRow: { alignItems: "center", borderTopColor: colors.line, borderTopWidth: 1, flexDirection: "row", paddingVertical: 14 },
  notice: { color: colors.warning, fontSize: 12, marginBottom: 8 },
  of: { color: colors.muted, fontSize: 13, fontWeight: "500" },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  spent: { color: colors.text, fontSize: 22, fontWeight: "900", marginTop: 4 },
  subcopy: { color: colors.muted, fontSize: 13, marginTop: 3 },
  verticalDivider: { backgroundColor: colors.primarySoft, height: 42, width: 1 },
});
