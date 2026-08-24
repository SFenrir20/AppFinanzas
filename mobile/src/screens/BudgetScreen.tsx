import { Plus } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { budgetCategories } from "../data/localFeatures";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { colors, radii } from "../design/tokens";
import { formatPEN } from "../utils/money";

export function BudgetScreen() {
  const spent = budgetCategories.reduce((sum, category) => sum + category.spent, 0);
  const limit = budgetCategories.reduce((sum, category) => sum + category.limit, 0);
  const progress = limit ? Math.round((spent / limit) * 100) : 0;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Presupuesto</Text>
        <View style={styles.addIcon}>
          <Plus color={colors.surface} size={20} />
        </View>
      </View>
      <Card dark style={styles.hero}>
        <Text style={styles.heroLabel}>Presupuesto mensual</Text>
        <Text style={styles.heroAmount}>{formatPEN(limit, true)}</Text>
        <ProgressBar value={progress} fillColor={colors.warning} />
        <View style={styles.heroFooter}>
          <Text style={styles.heroText}>Gastado {formatPEN(spent, true)}</Text>
          <Text style={styles.heroText}>{progress}% usado</Text>
        </View>
      </Card>
      <Text style={styles.sectionTitle}>Categorias</Text>
      <View style={styles.list}>
        {budgetCategories.map((category) => {
          const value = category.limit ? Math.round((category.spent / category.limit) * 100) : 0;
          return (
            <Card key={category.name} style={styles.categoryCard}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.meta}>{formatPEN(category.spent, true)} de {formatPEN(category.limit, true)}</Text>
                </View>
                <Text style={[styles.percent, value >= 90 && styles.warning]}>{value}%</Text>
              </View>
              <ProgressBar value={value} fillColor={category.color} />
            </Card>
          );
        })}
      </View>
      <View style={styles.pendingBox}>
        <Text style={styles.pendingTitle}>Gestion local</Text>
        <Text style={styles.pendingText}>
          El backend aun no tiene endpoints de presupuesto. Estos valores son locales y no se sincronizan.
        </Text>
      </View>
      <AppButton disabled>Crear categoria</AppButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addIcon: { alignItems: "center", backgroundColor: colors.warning, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  categoryCard: { gap: 12 },
  categoryName: { color: colors.text, fontSize: 16, fontWeight: "900" },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingTop: 14, marginBottom: 18 },
  hero: { gap: 14, marginBottom: 20 },
  heroAmount: { color: colors.surface, fontSize: 32, fontWeight: "900" },
  heroFooter: { flexDirection: "row", justifyContent: "space-between" },
  heroLabel: { color: colors.surface, fontSize: 14 },
  heroText: { color: colors.surface, fontSize: 13, fontWeight: "700" },
  list: { gap: 12 },
  meta: { color: colors.muted, fontSize: 13, marginTop: 3 },
  pendingBox: { backgroundColor: colors.surfaceMuted, borderRadius: radii.md, marginVertical: 18, padding: 14 },
  pendingText: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  pendingTitle: { color: colors.primary, fontSize: 13, fontWeight: "900" },
  percent: { color: colors.primary, fontSize: 18, fontWeight: "900" },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginBottom: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  warning: { color: colors.warning },
});
