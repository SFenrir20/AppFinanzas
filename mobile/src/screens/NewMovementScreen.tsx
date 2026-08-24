import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Camera, ChevronDown, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { createExpense, listAccounts, listCards } from "../api/finance";
import { BankAccount, CreditCard } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { AppButton } from "../components/AppButton";
import { Screen } from "../components/Screen";
import { SegmentedControl } from "../components/SegmentedControl";
import { colors, radii } from "../design/tokens";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "NewMovement">;
type Mode = "expense" | "income" | "transfer";
type Source = "account" | "card";

const modes = [
  { label: "Gasto", value: "expense" as Mode },
  { label: "Ingreso", value: "income" as Mode },
  { label: "Transfer.", value: "transfer" as Mode },
];

const categories = ["Alimentacion", "Transporte", "Vivienda", "Salud", "Otros"];

export function NewMovementScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [mode, setMode] = useState<Mode>("expense");
  const [source, setSource] = useState<Source>("account");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    Promise.all([listAccounts(token), listCards(token)])
      .then(([nextAccounts, nextCards]) => {
        setAccounts(nextAccounts);
        setCards(nextCards);
      })
      .catch(() => Alert.alert("Conexion", "No se pudieron cargar cuentas y tarjetas."));
  }, [token]);

  const selectedAccount = accounts[0];
  const selectedCard = cards[0];
  const sourceAvailable = source === "account" ? selectedAccount : selectedCard;
  const saveDisabled = !token || saving || mode !== "expense" || !amount || !description || !sourceAvailable;

  const destinationLabel = useMemo(() => {
    if (source === "account") return selectedAccount?.name ?? "Sin cuenta disponible";
    return selectedCard?.name ?? "Sin tarjeta disponible";
  }, [selectedAccount, selectedCard, source]);

  function handleMode(nextMode: Mode) {
    setMode(nextMode);
    if (nextMode !== "expense") {
      Alert.alert("Funcion local", "Ingresos y transferencias aun no tienen endpoint en el backend.");
    }
  }

  async function saveExpense() {
    if (!token || !sourceAvailable) return;
    setSaving(true);
    try {
      await createExpense(token, {
        amount,
        description,
        category,
        source,
        bank_account_id: source === "account" ? selectedAccount?.id : undefined,
        credit_card_id: source === "card" ? selectedCard?.id : undefined,
      });
      navigation.goBack();
    } catch {
      Alert.alert("No se guardo", "Revisa el monto, la cuenta o la conexion con la API.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll padded={false}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.close}>
          <X color={colors.surface} size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Nuevo movimiento</Text>
        <View style={styles.closeSpacer} />
      </View>
      <View style={styles.sheet}>
        <SegmentedControl options={modes} value={mode} onChange={handleMode} />
        <Text style={styles.amountLabel}>Monto</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currency}>S/</Text>
          <TextInput
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.faint}
            value={amount}
            onChangeText={setAmount}
            style={styles.amountInput}
          />
        </View>
        <TextInput
          placeholder="Descripcion"
          placeholderTextColor={colors.muted}
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />
        <View style={styles.chips}>
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[styles.chip, category === item && styles.activeChip]}
            >
              <Text style={[styles.chipText, category === item && styles.activeChipText]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Pagar desde</Text>
        <View style={styles.sourceRow}>
          <Pressable onPress={() => setSource("account")} style={[styles.sourceCard, source === "account" && styles.activeSource]}>
            <Text style={styles.sourceLabel}>Cuenta</Text>
          </Pressable>
          <Pressable onPress={() => setSource("card")} style={[styles.sourceCard, source === "card" && styles.activeSource]}>
            <Text style={styles.sourceLabel}>Tarjeta</Text>
          </Pressable>
        </View>
        <View style={styles.destination}>
          <Text style={styles.destinationText}>{destinationLabel}</Text>
          <ChevronDown color={colors.muted} size={18} />
        </View>
        <Pressable onPress={() => navigation.navigate("Scanner")} style={styles.scanButton}>
          <Camera color={colors.primary} size={20} />
          <Text style={styles.scanText}>Escanear comprobante</Text>
        </Pressable>
        <Text style={styles.notice}>
          El escaner y los flujos de ingreso/transferencia son UI local hasta que existan endpoints.
        </Text>
        <AppButton disabled={saveDisabled} onPress={() => void saveExpense()}>
          {saving ? "Guardando..." : "Guardar movimiento"}
        </AppButton>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  activeChip: { backgroundColor: colors.primary },
  activeChipText: { color: colors.surface },
  activeSource: { borderColor: colors.warning, borderWidth: 2 },
  amountInput: { color: colors.text, flex: 1, fontSize: 42, fontWeight: "900", minHeight: 64 },
  amountLabel: { color: colors.muted, fontSize: 13, marginTop: 22, textAlign: "center" },
  amountRow: { alignItems: "center", flexDirection: "row", justifyContent: "center" },
  chip: { backgroundColor: colors.surfaceMuted, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 10 },
  chipText: { color: colors.muted, fontSize: 13, fontWeight: "800" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18, marginTop: 14 },
  close: { alignItems: "center", height: 40, justifyContent: "center", width: 40 },
  closeSpacer: { width: 40 },
  currency: { color: colors.primary, fontSize: 28, fontWeight: "900", marginRight: 8 },
  destination: { alignItems: "center", backgroundColor: colors.surfaceMuted, borderRadius: radii.md, flexDirection: "row", justifyContent: "space-between", minHeight: 50, paddingHorizontal: 14 },
  destinationText: { color: colors.text, fontSize: 14, fontWeight: "800" },
  header: { alignItems: "center", backgroundColor: colors.primary, flexDirection: "row", justifyContent: "space-between", paddingBottom: 28, paddingHorizontal: 16, paddingTop: 16 },
  headerTitle: { color: colors.surface, fontSize: 17, fontWeight: "900" },
  input: { backgroundColor: colors.surfaceMuted, borderRadius: radii.md, color: colors.text, minHeight: 52, paddingHorizontal: 14 },
  label: { color: colors.text, fontSize: 14, fontWeight: "900", marginBottom: 8 },
  notice: { color: colors.muted, fontSize: 12, lineHeight: 17, marginVertical: 14 },
  scanButton: { alignItems: "center", borderColor: colors.line, borderRadius: radii.md, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 16, minHeight: 52, paddingHorizontal: 14 },
  scanText: { color: colors.primary, fontSize: 14, fontWeight: "900" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, flex: 1, marginTop: -18, padding: 20 },
  sourceCard: { backgroundColor: colors.surfaceMuted, borderColor: colors.surfaceMuted, borderRadius: radii.md, borderWidth: 2, flex: 1, padding: 14 },
  sourceLabel: { color: colors.primary, fontSize: 14, fontWeight: "900", textAlign: "center" },
  sourceRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
});
