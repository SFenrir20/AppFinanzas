import { StyleSheet, View } from "react-native";

import { colors, radii } from "../design/tokens";

type Props = {
  value: number;
  trackColor?: string;
  fillColor?: string;
  height?: number;
};

export function ProgressBar({
  value,
  trackColor = colors.line,
  fillColor = colors.accent,
  height = 8,
}: Props) {
  const width = `${Math.max(0, Math.min(100, value))}%` as const;
  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}>
      <View style={[styles.fill, { backgroundColor: fillColor, width, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { height: "100%" },
  track: { overflow: "hidden", width: "100%" },
});
