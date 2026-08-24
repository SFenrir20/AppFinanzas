import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LogoMark } from "../components/LogoMark";
import { Screen } from "../components/Screen";
import { colors } from "../design/tokens";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace("Onboarding"), 900);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Screen dark>
      <View style={styles.center}>
        <LogoMark size={80} />
        <Text style={styles.brand}>Finza</Text>
        <Text style={styles.subtitle}>Tus finanzas, bajo control.</Text>
      </View>
      <View style={styles.dots}>
        <View style={styles.dotActive} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { color: colors.surface, fontSize: 34, fontWeight: "900", marginTop: 24 },
  center: { alignItems: "center", flex: 1, justifyContent: "center" },
  dot: { backgroundColor: colors.primarySoft, borderRadius: 4, height: 7, width: 7 },
  dotActive: { backgroundColor: colors.accent, borderRadius: 4, height: 7, width: 22 },
  dots: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center", paddingBottom: 54 },
  subtitle: { color: colors.accent, fontSize: 15, marginTop: 8 },
});
