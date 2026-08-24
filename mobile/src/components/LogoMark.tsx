import { TrendingUp } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { colors, radii } from "../design/tokens";

type Props = {
  size?: number;
};

export function LogoMark({ size = 80 }: Props) {
  const dot = Math.max(10, size * 0.16);
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: Math.min(radii.lg, size / 4),
        },
      ]}
    >
      <TrendingUp color={colors.accent} size={size * 0.42} strokeWidth={2.4} />
      <View style={[styles.dot, { width: dot, height: dot, borderRadius: dot / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.accent,
    borderWidth: 1,
    justifyContent: "center",
  },
  dot: {
    backgroundColor: colors.warning,
    position: "absolute",
    right: -4,
    top: -4,
  },
});
