import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowDown, Laptop, Plus, WalletCards } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { colors, radii, shadow } from "../design/tokens";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

const slides = [
  {
    title: "Controla tus gastos",
    copy: "Registra tus ingresos y gastos de manera sencilla.",
    cta: "Siguiente",
    illustration: "expenses",
  },
  {
    title: "Planifica tu dinero",
    copy: "Crea presupuestos y descubre cuanto puedes gastar cada mes.",
    cta: "Siguiente",
    illustration: "budget",
  },
  {
    title: "Cumple tus metas",
    copy: "Ahorra para aquello que realmente importa.",
    cta: "Comenzar",
    illustration: "goals",
  },
];

export function OnboardingScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  function next() {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      navigation.replace("Login");
    }
  }

  return (
    <Screen>
      <View style={styles.skipRow}>
        <Pressable onPress={() => navigation.replace("Login")} hitSlop={12}>
          <Text style={styles.skip}>Omitir</Text>
        </Pressable>
      </View>
      <View style={styles.illustrationWrap}>
        <Illustration kind={slide.illustration} />
      </View>
      <View style={styles.copyBlock}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.copy}>{slide.copy}</Text>
      </View>
      <View style={styles.dots}>
        {slides.map((item, dotIndex) => (
          <View key={item.title} style={dotIndex === index ? styles.dotActive : styles.dot} />
        ))}
      </View>
      <View style={styles.footer}>
        <AppButton onPress={next}>{slide.cta}</AppButton>
        <AppButton variant="ghost" onPress={() => navigation.replace("Login")}>
          Ya tengo una cuenta
        </AppButton>
      </View>
    </Screen>
  );
}

function Illustration({ kind }: { kind: string }) {
  if (kind === "budget") {
    return (
      <View style={styles.miniCardLight}>
        <Text style={styles.miniTitle}>Mi presupuesto</Text>
        <ProgressBar value={70} height={6} />
        <View style={styles.budgetRow}>
          <Text style={styles.budgetText}>Alimentacion</Text>
          <View style={styles.budgetSmallBar} />
        </View>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetText}>Entretenimiento</Text>
          <View style={[styles.budgetSmallBar, { backgroundColor: colors.warning }]} />
        </View>
      </View>
    );
  }
  if (kind === "goals") {
    return (
      <View style={styles.goalCard}>
        <Text style={styles.goalLabel}>MacBook nueva</Text>
        <Text style={styles.goalAmount}>S/ 3,200 <Text style={styles.goalMuted}>S/ 6,000</Text></Text>
        <ProgressBar value={53} height={6} trackColor={colors.primarySoft} />
        <View style={styles.goalBadges}>
          <View style={styles.arrowBubble}><ArrowDown color={colors.success} size={20} /></View>
          <Text style={styles.percentBubble}>37%</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.expenseCard}>
      <Text style={styles.expenseLabel}>Saldo disponible</Text>
      <Text style={styles.expenseAmount}>S/ 8,540.50</Text>
      <ProgressBar value={42} height={6} />
      <View style={styles.fakeLine} />
      <View style={styles.plusBubble}><Plus color={colors.warning} size={20} /></View>
      <WalletCards color={colors.accent} size={20} style={styles.walletIcon} />
    </View>
  );
}

const styles = StyleSheet.create({
  arrowBubble: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  budgetRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  budgetSmallBar: { backgroundColor: colors.accent, borderRadius: 4, height: 5, width: 24 },
  budgetText: { fontSize: 11 },
  copy: { color: colors.primarySoft, fontSize: 17, lineHeight: 26, marginTop: 14, textAlign: "center" },
  copyBlock: { alignItems: "center", marginTop: 52 },
  dot: { backgroundColor: colors.faint, borderRadius: 4, height: 8, width: 8 },
  dotActive: { backgroundColor: colors.primary, borderRadius: 4, height: 8, width: 24 },
  dots: { flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 116 },
  expenseAmount: { color: colors.surface, fontSize: 16, fontWeight: "900" },
  expenseCard: {
    backgroundColor: colors.primary,
    borderColor: colors.ink,
    borderRadius: radii.md,
    minHeight: 92,
    padding: 14,
    width: 142,
    ...shadow.card,
  },
  expenseLabel: { color: colors.surface, fontSize: 11 },
  fakeLine: { backgroundColor: colors.line, borderRadius: 4, height: 5, marginTop: 10, width: 54 },
  footer: { gap: 12, marginTop: "auto", paddingBottom: 22 },
  goalAmount: { color: colors.surface, fontSize: 15, fontWeight: "900", marginVertical: 5 },
  goalBadges: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 8 },
  goalCard: {
    backgroundColor: colors.primary,
    borderColor: colors.ink,
    borderRadius: radii.md,
    padding: 14,
    width: 160,
    ...shadow.card,
  },
  goalLabel: { color: colors.surface, fontSize: 11, fontWeight: "700" },
  goalMuted: { color: colors.faint, fontSize: 12, fontWeight: "500" },
  illustrationWrap: { alignItems: "center", justifyContent: "center", marginTop: 154, minHeight: 120 },
  miniCardLight: { backgroundColor: colors.surface, borderRadius: radii.md, padding: 14, width: 162, ...shadow.card },
  miniTitle: { color: colors.text, fontSize: 12, fontWeight: "900", marginBottom: 8 },
  percentBubble: {
    backgroundColor: "#FFF1DA",
    borderRadius: 14,
    color: colors.warning,
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  plusBubble: {
    alignItems: "center",
    backgroundColor: "#FFF1DA",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: -12,
    top: 54,
    width: 32,
  },
  skip: { color: colors.primary, fontSize: 14 },
  skipRow: { alignItems: "flex-end", paddingTop: 24 },
  title: { color: colors.text, fontSize: 24, fontWeight: "900", textAlign: "center" },
  walletIcon: { bottom: 12, left: 18, position: "absolute" },
});
