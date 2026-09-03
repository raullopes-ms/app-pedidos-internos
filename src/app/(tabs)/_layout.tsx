import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AssetIcon } from "@/components/AssetIcon";
import { useCart } from "@/contexts/CartContext";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);
  const { itemCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#F08510",
        tabBarInactiveTintColor: "#666666",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          lineHeight: 14,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarItemStyle: {
          height: 58,
          justifyContent: "center",
          paddingVertical: 4,
        },
        tabBarStyle: {
          borderTopColor: "#E8E8E8",
          height: 68 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Produtos",
          tabBarIcon: ({ color, size }) => (
            <AssetIcon color={color} name="box" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-orders"
        options={{
          title: "Meus Pedidos",
          tabBarLabel: "Pedidos",
          tabBarIcon: ({ color, size }) => (
            <AssetIcon color={color} name="documentText" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Carrinho",
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <AssetIcon color={color} name="shoppingCart" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
