import {
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from "react-native";

import { AssetIcon } from "@/components/AssetIcon";

type SearchProps = Omit<TextInputProps, "value" | "onChangeText"> & {
  value: string;
  onChangeText: (value: string) => void;
  onClear?: () => void;
};

export function Search({
  value,
  onChangeText,
  onClear,
  placeholder = "Buscar produto",
  ...props
}: SearchProps) {
  const handleClear = () => {
    onChangeText("");
    onClear?.();
  };

  return (
    <View className="h-[52px] w-full flex-row items-center rounded-xl bg-[#F1F2F4] px-4">
      <AssetIcon color="#666666" name="search" size={20} />
      <TextInput
        className="ml-3 flex-1 text-base text-black"
        placeholder={placeholder}
        placeholderTextColor="#666666"
        returnKeyType="search"
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
      {value.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          className="ml-2 h-8 w-8 items-center justify-center"
          onPress={handleClear}
        >
          <AssetIcon color="#666666" name="closeCircle" size={20} />
        </TouchableOpacity>
      )}
    </View>
  );
}
