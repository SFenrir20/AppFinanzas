import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii } from "../design/tokens";

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.item, active && styles.active]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  active: { backgroundColor: colors.primary },
  activeLabel: { color: colors.surface },
  container: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    flexDirection: "row",
    padding: 4,
  },
  item: {
    alignItems: "center",
    borderRadius: radii.pill,
    flex: 1,
    minHeight: 36,
    justifyContent: "center",
  },
  label: { color: colors.muted, fontSize: 14, fontWeight: "700" },
});
