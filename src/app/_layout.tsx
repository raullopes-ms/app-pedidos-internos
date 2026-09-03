import "../../global.css";

import { Stack } from "expo-router";
import { verifyInstallation } from "nativewind";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { DataRefreshProvider } from "@/contexts/DataRefreshContext";

if (__DEV__) {
  verifyInstallation();
}

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hide();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <DataRefreshProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)/login" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </DataRefreshProvider>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </>
  );
}
