import { memo } from "react";
import {
  Image,
  Text,
  type ImageSourcePropType,
  TouchableOpacity,
  View,
} from "react-native";

import { AssetIcon } from "@/components/AssetIcon";

type ProductCardProps = {
  description: string;
  image?: ImageSourcePropType;
  codprod: string;
  onAddToCart?: () => void;
  price: string;
  vol?: string;
};

function ProductCardComponent({
  description,
  image,
  codprod,
  onAddToCart,
  price,
  vol,
}: ProductCardProps) {
  return (
    <View
      className={`flex-1 rounded-lg border border-[#E8E8E8] bg-white p-3 shadow-sm`}
    >
      <View className="mb-3 h-32 w-full items-center justify-center rounded-md ">
        {image ? (
          <Image
            source={image}
            className="h-full w-full"
            resizeMode="contain"
            resizeMethod="scale"
            fadeDuration={0}
          />
        ) : (
          <Text className="text-3xl font-bold text-[#F08510]">
            {description.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <Text
        className="min-h-10 text-sm font-semibold text-[#333333]"
        numberOfLines={2}
      >
        {description}
      </Text>
      {vol && (
        <Text className="mt-1 text-xs font-medium text-[#666666]">
          Volume: {vol}
        </Text>
      )}
      {/* <Text className="mt-1 text-xs font-medium text-[#666666]">
        Codigo: {codprod}
      </Text> */}
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-[#F08510]">{price}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#F08510]"
          onPress={onAddToCart}
        >
          <AssetIcon color="#FFFFFF" name="shoppingCart" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const ProductCard = memo(ProductCardComponent);
