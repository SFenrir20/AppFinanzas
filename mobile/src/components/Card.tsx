import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { colors, radii, shadow } from "../design/tokens";

type Props = {
  children: ReactNode;
  dark?: boolean;
  style?: ViewStyle;
};

export function Card({ children, dark, style }: Props) {
  return <View style={[styles.card, dark && styles.dark, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    ...shadow.card,
  },
  dark: {
    backgroundColor: colors.primary,
    borderColor: colors.ink,
    borderWidth: 1,
  },
});
