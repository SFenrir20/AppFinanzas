import { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../design/tokens";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  dark?: boolean;
  padded?: boolean;
};

export function Screen({ children, scroll = false, dark = false, padded = true }: Props) {
  const content = <View style={[styles.content, padded && styles.padded]}>{children}</View>;

  return (
    <SafeAreaView style={[styles.safe, dark && styles.dark]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  dark: { backgroundColor: colors.primary },
  padded: { paddingHorizontal: 20 },
  safe: { backgroundColor: colors.background, flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 96 },
});
