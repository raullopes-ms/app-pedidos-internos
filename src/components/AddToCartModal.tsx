import { useEffect, useMemo, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AssetIcon } from "@/components/AssetIcon";
import { Button } from "@/components/Button";
import type { Product } from "@/services/products";

type AddToCartModalProps = {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (product: Product, quantity: number) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

export function AddToCartModal({
  product,
  visible,
  onClose,
  onConfirm,
}: AddToCartModalProps) {
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (visible) {
      setQuantity(1);
    }
  }, [visible, product?.codProd]);

  const total = useMemo(
    () => (product ? product.vlrVenda * quantity : 0),
    [product, quantity],
  );

  const increment = () => {
    setQuantity((currentQuantity) => currentQuantity + 1);
  };

  const decrement = () => {
    setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1));
  };

  const handleConfirm = () => {
    if (!product) {
      return;
    }

    onConfirm(product, quantity);
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View
          className="rounded-t-2xl bg-white px-6 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}
        >
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-[#333333]">
              Adicionar ao carrinho
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              className="h-9 w-9 items-center justify-center"
              onPress={onClose}
            >
              <AssetIcon color="#666666" name="closeCircle" size={24} />
            </TouchableOpacity>
          </View>

          {product && (
            <>
              <Text
                className="text-base font-semibold text-[#333333]"
                numberOfLines={2}
              >
                {product.descrProd}
              </Text>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-[#666666]">
                  Codigo: {product.codProd}
                </Text>
                <Text className="text-sm font-medium text-[#666666]">
                  Volume: {product.codVol}
                </Text>
              </View>

              <View className="my-6 flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-medium text-[#666666]">
                    Preco unitario
                  </Text>
                  <Text className="text-2xl font-bold text-[#F08510]">
                    {formatCurrency(product.vlrVenda)}
                  </Text>
                </View>

                <View className="flex-row items-center rounded-full bg-[#F1F2F4] p-1">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="h-10 w-10 items-center justify-center rounded-full bg-white"
                    onPress={decrement}
                  >
                    <AssetIcon color="#F08510" name="minus" size={20} />
                  </TouchableOpacity>
                  <Text className="min-w-12 text-center text-lg font-semibold text-[#333333]">
                    {quantity}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="h-10 w-10 items-center justify-center rounded-full bg-[#F08510]"
                    onPress={increment}
                  >
                    <AssetIcon color="#FFFFFF" name="add" size={20} />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-5 flex-row items-center justify-between border-t border-[#E8E8E8] pt-4">
                <Text className="text-base font-medium text-[#333333]">
                  Total
                </Text>
                <Text className="text-2xl font-bold text-[#F08510]">
                  {formatCurrency(total)}
                </Text>
              </View>

              <Button title="Adicionar" onPress={handleConfirm} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
