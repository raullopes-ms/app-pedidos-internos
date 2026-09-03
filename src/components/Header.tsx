import { Text, TouchableOpacity, View } from "react-native";

import { AssetIcon } from "@/components/AssetIcon";

type HeaderProps = {
  availableLimit?: number | null;
  isLoadingLimit?: boolean;
  name?: string | null;
  onLogout: () => void;
};

function getShortName(name?: string | null) {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (words.length === 0) {
    return "Cliente";
  }

  return words.slice(0, 2).join(" ");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

export function Header({
  availableLimit,
  isLoadingLimit = false,
  name,
  onLogout,
}: HeaderProps) {
  const displayName = getShortName(name);
  const creditLimitText = isLoadingLimit
    ? "Consultando..."
    : availableLimit === null || availableLimit === undefined
      ? "Indisponivel"
      : formatCurrency(availableLimit);

  return (
    <View className="w-full">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base font-medium text-[#333333]">
            Seja bem vindo (a)
          </Text>
          <Text className="text-base font-medium text-[#F08510]">
            {displayName}
          </Text>
          <Text className="mt-1 text-sm font-semibold text-[#333333]">
            Limite disponivel:{" "}
            <Text className="text-[#F08510]">{creditLimitText}</Text>
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onLogout}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#F08510]"
        >
          <AssetIcon color="#FFFFFF" name="logoutCurve" size={20} />
        </TouchableOpacity>
      </View>

      <View className="mt-4 border-b border-[#D9D9D9]" />
    </View>
  );
}
