import Svg, { Circle } from "react-native-svg";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../design/tokens";

type Segment = {
  value: number;
  color: string;
};

type Props = {
  total: string;
  segments: Segment[];
};

export function DonutChart({ total, segments }: Props) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  return (
    <View style={styles.wrap}>
      <Svg width={112} height={112} viewBox="0 0 112 112">
        <Circle cx="56" cy="56" r={radius} stroke={colors.line} strokeWidth={18} fill="none" />
        {segments.map((segment, index) => {
          const dash = (segment.value / totalValue) * circumference;
          const circle = (
            <Circle
              key={`${segment.color}-${index}`}
              cx="56"
              cy="56"
              r={radius}
              stroke={segment.color}
              strokeWidth={18}
              fill="none"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              rotation="-90"
              origin="56,56"
            />
          );
          offset += dash;
          return circle;
        })}
      </Svg>
      <View style={styles.center}>
        <Text style={styles.centerLabel}>Total</Text>
        <Text style={styles.centerValue}>{total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", position: "absolute" },
  centerLabel: { color: colors.muted, fontSize: 10 },
  centerValue: { color: colors.text, fontSize: 13, fontWeight: "900" },
  wrap: { alignItems: "center", justifyContent: "center" },
});
