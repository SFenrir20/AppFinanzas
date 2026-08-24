import { StyleSheet, Text, View } from "react-native";

import { colors, radii } from "../design/tokens";

type Props = {
  children: string;
  tone?: "accent" | "warning" | "muted";
};

export function StatusPill({ children, tone = "accent" }: Props) {
  return (
    <View style={[styles.base, styles[tone]]}>
      <Text style={[styles.text, tone === "warning" && styles.warningText]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  accent: { backgroundColor: "#E8F6F7" },
  base: { borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  muted: { backgroundColor: colors.surfaceMuted },
  text: { color: colors.success, fontSize: 12, fontWeight: "800" },
  warning: { backgroundColor: "#FFF2DD" },
  warningText: { color: colors.warning },
});
