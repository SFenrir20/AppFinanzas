import { Camera, Flashlight, Image as ImageIcon, X } from "lucide-react-native";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../components/Screen";
import { colors } from "../design/tokens";
import { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Scanner">;

export function ReceiptScannerScreen({ navigation }: Props) {
  function unavailable() {
    Alert.alert("Escaner pendiente", "La captura y lectura de comprobantes quedan fuera del MVP backend.");
  }

  return (
    <Screen dark padded={false}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <X color={colors.surface} size={24} />
          </Pressable>
          <Text style={styles.title}>Escaner</Text>
          <Pressable onPress={unavailable} style={styles.iconButton}>
            <Flashlight color={colors.surface} size={22} />
          </Pressable>
        </View>
        <View style={styles.cameraBox}>
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
          <View style={styles.gridLine} />
          <Text style={styles.cameraText}>Coloca el comprobante dentro del marco</Text>
        </View>
        <View style={styles.bottomPanel}>
          <Pressable onPress={unavailable} style={styles.gallery}>
            <ImageIcon color={colors.surface} size={24} />
          </Pressable>
          <Pressable onPress={unavailable} style={styles.capture}>
            <Camera color={colors.primary} size={34} />
          </Pressable>
          <View style={styles.gallery} />
        </View>
        <Text style={styles.notice}>
          Vista preparada para el flujo visual. No solicita permisos ni procesa imagenes hasta implementar el servicio.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bottomPanel: { alignItems: "center", flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 46 },
  cameraBox: { backgroundColor: "#081417", borderRadius: 28, flex: 1, justifyContent: "center", margin: 20, overflow: "hidden" },
  cameraText: { alignSelf: "center", color: colors.surface, fontSize: 14, fontWeight: "800", marginTop: 90, opacity: 0.86 },
  capture: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 38, height: 76, justifyContent: "center", width: 76 },
  container: { flex: 1 },
  corner: { borderColor: colors.warning, height: 44, position: "absolute", width: 44 },
  cornerBottomLeft: { borderBottomWidth: 4, borderLeftWidth: 4, bottom: 42, left: 36 },
  cornerBottomRight: { borderBottomWidth: 4, borderRightWidth: 4, bottom: 42, right: 36 },
  cornerTopLeft: { borderLeftWidth: 4, borderTopWidth: 4, left: 36, top: 60 },
  cornerTopRight: { borderRightWidth: 4, borderTopWidth: 4, right: 36, top: 60 },
  gallery: { alignItems: "center", height: 52, justifyContent: "center", width: 52 },
  gridLine: { alignSelf: "center", backgroundColor: colors.accent, height: 2, opacity: 0.8, position: "absolute", top: "50%", width: "70%" },
  iconButton: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  notice: { color: colors.surface, fontSize: 12, lineHeight: 17, opacity: 0.72, padding: 20, textAlign: "center" },
  title: { color: colors.surface, fontSize: 18, fontWeight: "900" },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 12 },
});
