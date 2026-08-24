import { Flag, Home, List, Plus, Target, UserRound } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, shadow } from "../design/tokens";

export type AppTab = "home" | "movements" | "budget" | "goals" | "profile";

const tabs: Array<{ key: AppTab; label: string; icon: typeof Home }> = [
  { key: "home", label: "Inicio", icon: Home },
  { key: "movements", label: "Movimientos", icon: List },
  { key: "budget", label: "Presupuesto", icon: Target },
  { key: "goals", label: "Metas", icon: Flag },
  { key: "profile", label: "Perfil", icon: UserRound },
];

type Props = {
  active: AppTab;
  onChange: (tab: AppTab) => void;
  onNew: () => void;
};

export function BottomNav({ active, onChange, onNew }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(8, insets.bottom) }]}>
      {tabs.slice(0, 2).map((tab) => (
        <NavItem key={tab.key} tab={tab} active={active === tab.key} onPress={() => onChange(tab.key)} />
      ))}
      <Pressable onPress={onNew} style={styles.fab}>
        <Plus color={colors.surface} size={30} strokeWidth={2.4} />
      </Pressable>
      {tabs.slice(2).map((tab) => (
        <NavItem key={tab.key} tab={tab} active={active === tab.key} onPress={() => onChange(tab.key)} />
      ))}
    </View>
  );
}

function NavItem({
  tab,
  active,
  onPress,
}: {
  tab: { key: AppTab; label: string; icon: typeof Home };
  active: boolean;
  onPress: () => void;
}) {
  const Icon = tab.icon;
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Icon color={active ? colors.primary : colors.muted} size={22} strokeWidth={2} />
      <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activeLabel: { color: colors.primary, fontWeight: "800" },
  fab: {
    alignItems: "center",
    backgroundColor: colors.warning,
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    marginHorizontal: 4,
    marginTop: -28,
    width: 56,
    ...shadow.card,
  },
  item: { alignItems: "center", flex: 1, gap: 4, minHeight: 48, justifyContent: "center" },
  label: { color: colors.muted, fontSize: 11 },
  wrap: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    left: 0,
    paddingHorizontal: 10,
    paddingTop: 8,
    position: "absolute",
    right: 0,
  },
});
