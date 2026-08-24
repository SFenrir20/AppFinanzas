import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Apple, Eye, Fingerprint, Mail } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { LogoMark } from "../components/LogoMark";
import { Screen } from "../components/Screen";
import { useAuth } from "../auth/AuthContext";
import { colors, radii } from "../design/tokens";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert("No se pudo ingresar", error instanceof Error ? error.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen padded={false}>
      <View style={styles.hero}>
        <LogoMark size={56} />
        <Text style={styles.heroTitle}>Bienvenido</Text>
        <Text style={styles.heroCopy}>Inicia sesion en tu cuenta Finza</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Correo electronico</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="santiago@finza.app"
          style={styles.input}
          value={email}
        />
        <Text style={styles.label}>Contrasena</Text>
        <View style={styles.passwordWrap}>
          <TextInput
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            style={styles.passwordInput}
            value={password}
          />
          <Eye color={colors.muted} size={18} />
        </View>
        <Pressable onPress={() => Alert.alert("Pendiente", "Recuperacion de contrasena no esta implementada aun.")}>
          <Text style={styles.forgot}>¿Olvidaste tu contrasena?</Text>
        </Pressable>
        <AppButton disabled={submitting} onPress={handleSubmit}>
          {submitting ? "Ingresando..." : "Iniciar sesion"}
        </AppButton>
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>o continua con</Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.oauthRow}>
          <DisabledAuthButton icon={<Mail color="#4285F4" size={18} />} label="Google" />
          <DisabledAuthButton icon={<Apple color={colors.ink} size={18} />} label="Apple" />
        </View>
        <Pressable
          onPress={() => Alert.alert("Pendiente", "Biometria local pendiente de implementacion segura.")}
          style={styles.biometric}
        >
          <Fingerprint color={colors.success} size={18} />
          <Text style={styles.biometricText}>Usar Face ID / Huella</Text>
        </Pressable>
        <AppButton variant="outline" onPress={() => navigation.navigate("Register")}>
          Crear cuenta
        </AppButton>
      </View>
    </Screen>
  );
}

function DisabledAuthButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Pressable
      onPress={() => Alert.alert("Pendiente", `${label} requiere configurar OAuth en backend.`)}
      style={styles.oauthButton}
    >
      {icon}
      <Text style={styles.oauthText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  biometric: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center", paddingVertical: 12 },
  biometricText: { color: colors.success, fontSize: 14, fontWeight: "700" },
  divider: { backgroundColor: colors.line, flex: 1, height: 1 },
  dividerRow: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 6 },
  dividerText: { color: colors.muted, fontSize: 12 },
  forgot: { color: colors.success, fontSize: 14, marginBottom: 8, textAlign: "right" },
  form: { gap: 14, padding: 24 },
  hero: { alignItems: "center", backgroundColor: colors.primary, paddingBottom: 34, paddingTop: 38 },
  heroCopy: { color: colors.surface, fontSize: 14, marginTop: 8 },
  heroTitle: { color: colors.surface, fontSize: 26, fontWeight: "900", marginTop: 18 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  label: { color: colors.text, fontSize: 14, fontWeight: "800" },
  oauthButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 48,
  },
  oauthRow: { flexDirection: "row", gap: 14 },
  oauthText: { color: colors.text, fontSize: 15, fontWeight: "700" },
  passwordInput: { flex: 1 },
  passwordWrap: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: 16,
  },
});
