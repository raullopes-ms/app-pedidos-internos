import { Text, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & {
  label?: string;
}

export function Input({ label, ...rest }: Props) {
  return (
    <View className="w-full gap-2">
      {label && <Text className="text-sm font-medium text-[#333333]">{label}</Text>}
      <TextInput
        className="w-full h-[52px] pl-3 rounded-xl bg-[#F1F2F4] color-black"
        placeholderTextColor={"#666666"}
        {...rest}
      />
    </View>
  );
}
