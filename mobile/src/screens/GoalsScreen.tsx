import { Calendar, Plus } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { goals } from "../data/localFeatures";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { colors, radii } from "../design/tokens";
import { formatPEN } from "../utils/money";

export function GoalsScreen() {
  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Metas</Text>
        <View style={styles.addIcon}>
          <Plus color={colors.surface} size={20} />
        </View>
      </View>
      <View style={styles.goalList}>
        {goals.map((goal) => {
          const value = goal.target ? Math.round((goal.saved / goal.target) * 100) : 0;
          return (
            <Card key={goal.name} style={[styles.goalCard, { backgroundColor: goal.color }]}>
              <View style={styles.rowBetween}>
                <Text style={styles.goalName}>{goal.name}</Text>
                <Text style={styles.goalPercent}>{value}%</Text>
              </View>
              <Text style={styles.goalAmount}>{formatPEN(goal.saved, true)} / {formatPEN(goal.target, true)}</Text>
              <ProgressBar value={value} fillColor={colors.warning} />
              <View style={styles.goalFooter}>
                <Calendar color={colors.surface} size={16} />
                <Text style={styles.goalDate}>Meta: {goal.targetDate}</Text>
              </View>
            </Card>
          );
        })}
      </View>
      <View style={styles.pendingBox}>
        <Text style={styles.pendingTitle}>Sincronizacion pendiente</Text>
        <Text style={styles.pendingText}>
          Las metas son una vista local de diseno. El backend aun no expone metas ni aportes.
        </Text>
      </View>
      <AppButton disabled>Nueva meta</AppButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addIcon: { alignItems: "center", backgroundColor: colors.warning, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  goalAmount: { color: colors.surface, fontSize: 15, fontWeight: "800", marginVertical: 12 },
  goalCard: { gap: 4 },
  goalDate: { color: colors.surface, fontSize: 13, fontWeight: "700" },
  goalFooter: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: 8 },
  goalList: { gap: 14 },
  goalName: { color: colors.surface, flex: 1, fontSize: 18, fontWeight: "900" },
  goalPercent: { color: colors.warning, fontSize: 22, fontWeight: "900" },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingTop: 14, marginBottom: 18 },
  pendingBox: { backgroundColor: colors.surfaceMuted, borderRadius: radii.md, marginVertical: 18, padding: 14 },
  pendingText: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  pendingTitle: { color: colors.primary, fontSize: 13, fontWeight: "900" },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
});
