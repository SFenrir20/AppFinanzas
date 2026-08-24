import { Bell, ChevronRight, CreditCard, Lock, LogOut, Shield, UserRound } from "lucide-react-native";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth/AuthContext";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { colors } from "../design/tokens";
import { formatPEN } from "../utils/money";

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const name = user?.email.split("@")[0] ?? "Santiago";

  function disabledFeature(label: string) {
    Alert.alert(label, "Esta funcion requiere soporte de backend y se mantiene deshabilitada en el MVP.");
  }

  return (
    <Screen scroll padded={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      <View style={styles.body}>
        <Card style={styles.profileCard}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.label}>Moneda</Text>
              <Text style={styles.value}>{user?.profile.currency ?? "PEN"}</Text>
            </View>
            <View>
              <Text style={styles.label}>Salario mensual</Text>
              <Text style={styles.value}>{formatPEN(user?.profile.monthly_salary ?? 0, true)}</Text>
            </View>
          </View>
        </Card>
        <Card style={styles.menu}>
          <MenuRow icon={Shield} label="Seguridad" onPress={() => disabledFeature("Seguridad")} />
          <MenuRow icon={Lock} label="Biometria" disabled onPress={() => disabledFeature("Biometria")} />
          <MenuRow icon={CreditCard} label="Cuentas conectadas" disabled onPress={() => disabledFeature("OAuth")} />
          <MenuRow icon={Bell} label="Notificaciones" disabled onPress={() => disabledFeature("Notificaciones")} />
          <MenuRow icon={UserRound} label="Datos del perfil" disabled onPress={() => disabledFeature("Perfil")} />
        </Card>
        <Text style={styles.notice}>
          Seguridad avanzada, OAuth y biometria quedan como UI local hasta que el backend tenga esos endpoints.
        </Text>
        <AppButton variant="dark" onPress={() => void signOut()} style={styles.logout}>
          Cerrar sesion
        </AppButton>
      </View>
    </Screen>
  );
}

function MenuRow({
  icon: Icon,
  label,
  disabled,
  onPress,
}: {
  icon: typeof Shield;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.menuRow, disabled && styles.disabled]}>
      <View style={styles.menuIcon}>
        <Icon color={colors.primary} size={19} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <ChevronRight color={colors.muted} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 38, height: 76, justifyContent: "center", width: 76 },
  avatarText: { color: colors.primary, fontSize: 30, fontWeight: "900" },
  body: { marginTop: -22, paddingHorizontal: 20 },
  disabled: { opacity: 0.45 },
  email: { color: colors.surface, fontSize: 14, marginTop: 4 },
  header: { alignItems: "center", backgroundColor: colors.primary, paddingBottom: 44, paddingHorizontal: 20, paddingTop: 34 },
  label: { color: colors.muted, fontSize: 12 },
  logout: { marginTop: 18 },
  menu: { gap: 2, marginTop: 16 },
  menuIcon: { alignItems: "center", backgroundColor: colors.surfaceMuted, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  menuLabel: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "800" },
  menuRow: { alignItems: "center", borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: "row", gap: 12, minHeight: 56 },
  name: { color: colors.surface, fontSize: 24, fontWeight: "900", marginTop: 12 },
  notice: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 16 },
  profileCard: { gap: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  value: { color: colors.primary, fontSize: 18, fontWeight: "900", marginTop: 4 },
});
