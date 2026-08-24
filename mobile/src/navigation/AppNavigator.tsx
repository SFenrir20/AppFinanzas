import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../auth/AuthContext";
import { HomeScreen } from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {token ? (
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "AppFinanzas" }} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Ingresar" }} />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Crear cuenta" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
