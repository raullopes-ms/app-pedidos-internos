import {
  Image,
  type ColorValue,
  type ImageStyle,
  type StyleProp,
} from "react-native";

const iconSources = {
  add: require("../assets/Add-Linear-32px.png"),
  box: require("../assets/Box-Linear-32px.png"),
  closeCircle: require("../assets/CloseCircle-Linear-32px.png"),
  documentText: require("../assets/DocumentText-Linear-32px.png"),
  eye: require("../assets/Eye-Linear-32px.png"),
  eyeSlash: require("../assets/EyeSlash-Linear-32px.png"),
  infoCircle: require("../assets/InfoCircle-Linear-32px.png"),
  lock: require("../assets/Lock1-Linear-32px.png"),
  loginCurve: require("../assets/LoginCurve-Linear-32px.png"),
  logoutCurve: require("../assets/LogoutCurve-Linear-32px.png"),
  minus: require("../assets/Minus-Linear-32px.png"),
  search: require("../assets/SearchNormal1-Linear-32px.png"),
  shoppingCart: require("../assets/ShoppingCart-Linear-32px.png"),
  trash: require("../assets/Trash-Linear-32px.png"),
};

type AssetIconProps = {
  color?: ColorValue;
  name: keyof typeof iconSources;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function AssetIcon({
  color,
  name,
  size = 24,
  style,
}: AssetIconProps) {
  return (
    <Image
      source={iconSources[name]}
      resizeMode="contain"
      style={[{ height: size, tintColor: color, width: size }, style]}
    />
  );
}
