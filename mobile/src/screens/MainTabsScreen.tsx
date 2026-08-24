import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { View } from "react-native";

import { AppTab, BottomNav } from "../components/BottomNav";
import { RootStackParamList } from "../navigation/AppNavigator";
import { BudgetScreen } from "./BudgetScreen";
import { GoalsScreen } from "./GoalsScreen";
import { HomeScreen } from "./HomeScreen";
import { MovementsScreen } from "./MovementsScreen";
import { ProfileScreen } from "./ProfileScreen";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

export function MainTabsScreen({ navigation }: Props) {
  const [active, setActive] = useState<AppTab>("home");

  return (
    <View style={{ flex: 1 }}>
      {active === "home" && <HomeScreen onViewMovements={() => setActive("movements")} />}
      {active === "movements" && <MovementsScreen />}
      {active === "budget" && <BudgetScreen />}
      {active === "goals" && <GoalsScreen />}
      {active === "profile" && <ProfileScreen />}
      <BottomNav
        active={active}
        onChange={setActive}
        onNew={() => navigation.navigate("NewMovement")}
      />
    </View>
  );
}
