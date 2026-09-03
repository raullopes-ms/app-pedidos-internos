import { Text, TouchableOpacity, type TouchableOpacityProps } from "react-native";

type ButtonProps = TouchableOpacityProps & {
  title: string;
};

export function Button({
  title,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`h-[52px] w-full items-center justify-center rounded-xl bg-[#F08510] ${
        disabled ? "opacity-60" : ""
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      <Text className="text-base font-semibold text-white">{title}</Text>
    </TouchableOpacity>
  );
}
