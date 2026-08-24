import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth/AuthContext";

export function HomeScreen() {
  const { signOut, user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Sesion activa</Text>
      <Text style={styles.title}>{user?.email}</Text>
      <View style={styles.panel}>
        <Text style={styles.label}>Moneda</Text>
        <Text style={styles.value}>{user?.profile.currency}</Text>
        <Text style={styles.label}>Salario mensual</Text>
        <Text style={styles.value}>{user?.profile.monthly_salary}</Text>
      </View>
      <Pressable onPress={signOut} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Cerrar sesion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, padding: 24, paddingTop: 36 },
  eyebrow: { color: "#667085", fontSize: 13, fontWeight: "700", textTransform: "uppercase" },
  label: { color: "#667085", fontSize: 13, marginTop: 8 },
  panel: { borderColor: "#EAECF0", borderRadius: 8, borderWidth: 1, padding: 16 },
  secondaryButton: { alignItems: "center", borderColor: "#D0D5DD", borderRadius: 8, borderWidth: 1, padding: 14 },
  secondaryButtonText: { fontWeight: "700" },
  title: { fontSize: 22, fontWeight: "700" },
  value: { fontSize: 18, fontWeight: "700", marginTop: 4 },
});
