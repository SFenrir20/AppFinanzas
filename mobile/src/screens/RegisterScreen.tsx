import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "../auth/AuthContext";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await register(email.trim(), password);
    } catch (error) {
      Alert.alert("No se pudo crear la cuenta", error instanceof Error ? error.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />
      <TextInput
        onChangeText={setPassword}
        placeholder="Contrasena minima de 8 caracteres"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      <Pressable disabled={submitting} onPress={handleSubmit} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>{submitting ? "Creando..." : "Crear cuenta"}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.goBack()} style={styles.linkButton}>
        <Text>Ya tengo cuenta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, justifyContent: "center", padding: 24 },
  input: { borderColor: "#D0D5DD", borderRadius: 8, borderWidth: 1, padding: 12 },
  linkButton: { alignItems: "center", padding: 12 },
  primaryButton: { alignItems: "center", backgroundColor: "#1F2937", borderRadius: 8, padding: 14 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 12 },
});
