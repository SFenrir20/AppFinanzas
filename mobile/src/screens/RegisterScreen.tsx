import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { LogoMark } from "../components/LogoMark";
import { Screen } from "../components/Screen";
import { useAuth } from "../auth/AuthContext";
import { colors, radii } from "../design/tokens";
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
    <Screen>
      <View style={styles.header}>
        <LogoMark size={54} />
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.copy}>Empieza con correo y contrasena. Podras completar tu perfil despues.</Text>
      </View>
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
      <AppButton disabled={submitting} onPress={handleSubmit}>
        {submitting ? "Creando..." : "Crear cuenta"}
      </AppButton>
      <Pressable onPress={() => navigation.goBack()} style={styles.linkButton}>
        <Text style={styles.linkText}>Ya tengo cuenta</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, textAlign: "center" },
  header: { alignItems: "center", gap: 8, marginBottom: 28, marginTop: 64 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 14,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  linkButton: { alignItems: "center", padding: 12 },
  linkText: { color: colors.primary, fontWeight: "700" },
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
});
