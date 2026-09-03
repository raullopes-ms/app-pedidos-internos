import { Text, View } from "react-native";

import { AssetIcon } from "@/components/AssetIcon";

type AuthAlertProps = {
  message: string;
  title?: string;
};

export function AuthAlert({
  message,
  title = "Aviso",
}: AuthAlertProps) {
  return (
    <View className="flex-row gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
      <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-full bg-red-100">
        <AssetIcon color="#C62828" name="infoCircle" size={18} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-[#C62828]">{title}</Text>
        <Text className="mt-1 text-sm font-medium text-red-700">
          {message}
        </Text>
      </View>
    </View>
  );
}
