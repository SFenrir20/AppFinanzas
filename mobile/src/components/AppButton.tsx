import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { colors, radii, shadow } from "../design/tokens";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  variant?: "primary" | "outline" | "ghost" | "dark";
  disabled?: boolean;
  style?: ViewStyle;
};

export function AppButton({ children, onPress, variant = "primary", disabled, style }: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, variant === "outline" && styles.outlineText, variant === "ghost" && styles.ghostText]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radii.md,
    minHeight: 56,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  dark: { backgroundColor: colors.primary },
  disabled: { opacity: 0.5 },
  ghost: { backgroundColor: "transparent", minHeight: 44 },
  ghostText: { color: colors.primary },
  outline: { backgroundColor: colors.surface, borderColor: colors.ink, borderWidth: 1 },
  outlineText: { color: colors.ink },
  pressed: { opacity: 0.82 },
  primary: { backgroundColor: colors.warning, ...shadow.card },
  text: { color: colors.surface, fontSize: 16, fontWeight: "800" },
});
