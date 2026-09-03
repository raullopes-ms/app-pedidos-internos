import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AssetIcon } from "@/components/AssetIcon";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useDataRefresh } from "@/contexts/DataRefreshContext";
import { ApiError } from "@/services/api";
import { getCreditLimit } from "@/services/creditLimit";
import { createOrder } from "@/services/orders";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

function keyExtractor(item: CartItem) {
  return String(item.product.codProd);
}

type OrderFeedback = {
  kind: "success" | "error";
  title: string;
  message: string;
  orderIntegrationId?: number;
  sankhyaOrderId?: number | null;
  status?: string;
};

export default function Orders() {
  const insets = useSafeAreaInsets();
  const { signOut, token } = useAuth();
  const { clearCart, itemCount, items, removeItem, total, updateQuantity } =
    useCart();
  const { refreshVersion, requestDataRefresh } = useDataRefresh();
  const [availableLimit, setAvailableLimit] = useState<number | null>(null);
  const [isFetchingCreditLimit, setIsFetchingCreditLimit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<OrderFeedback | null>(null);
  const bottomPanelInset = Math.max(insets.bottom, 16) + 16;
  const isLimitUnavailable = availableLimit === null;
  const isOverLimit = availableLimit !== null && total > availableLimit;

  const fetchCreditLimit = useCallback(async () => {
    if (!token) {
      setAvailableLimit(null);
      setIsFetchingCreditLimit(false);
      return;
    }

    try {
      setIsFetchingCreditLimit(true);
      const response = await getCreditLimit(token);
      setAvailableLimit(response.availableLimit);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        Alert.alert("Sessao expirada", "Entre novamente para realizar pedido.");
        return;
      }

      setAvailableLimit(null);
    } finally {
      setIsFetchingCreditLimit(false);
    }
  }, [signOut, token]);

  useEffect(() => {
    fetchCreditLimit();
  }, [fetchCreditLimit, refreshVersion]);

  const handleClearCart = () => {
    if (items.length === 0) {
      return;
    }

    Alert.alert("Esvaziar carrinho", "Deseja remover todos os produtos?", [
      { style: "cancel", text: "Cancelar" },
      { onPress: clearCart, style: "destructive", text: "Esvaziar" },
    ]);
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0 || !token || isSubmitting) {
      return;
    }

    if (isLimitUnavailable) {
      Alert.alert(
        "Limite indisponivel",
        "Nao foi possivel consultar seu limite disponivel. Tente novamente em instantes.",
      );
      return;
    }

    if (isOverLimit) {
      Alert.alert(
        "Limite insuficiente",
        "O total do pedido e maior que seu limite disponivel.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createOrder(items, token);

      clearCart();
      requestDataRefresh();
      setFeedback({
        kind: "success",
        title: "Pedido realizado",
        message: response.sankhyaOrderId
          ? "Seu pedido foi criado no Sankhya com sucesso."
          : "Seu pedido foi enviado e esta aguardando retorno do Sankhya.",
        orderIntegrationId: response.orderIntegrationId,
        sankhyaOrderId: response.sankhyaOrderId,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        Alert.alert("Sessao expirada", "Entre novamente para realizar pedido.");
        return;
      }

      setFeedback({
        kind: "error",
        title: "Pedido nao enviado",
        message:
          err instanceof ApiError
            ? err.message
            : "Nao foi possivel enviar o pedido. Verifique sua conexao e tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View className="rounded-lg border border-[#E8E8E8] bg-white p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-[#333333]"
            numberOfLines={2}
          >
            {item.product.descrProd}
          </Text>
          <Text className="mt-1 text-xs font-medium text-[#666666]">
            Codigo: {item.product.codProd} | Volume: {item.product.codVol}
          </Text>
          <Text className="mt-2 text-lg font-bold text-[#F08510]">
            {formatCurrency(item.product.vlrVenda)}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="h-9 w-9 items-center justify-center rounded-full bg-[#F1F2F4]"
          onPress={() => removeItem(item.product.codProd)}
        >
          <AssetIcon color="#C62828" name="trash" size={18} />
        </TouchableOpacity>
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center rounded-full bg-[#F1F2F4] p-1">
          <TouchableOpacity
            activeOpacity={0.8}
            className="h-9 w-9 items-center justify-center rounded-full bg-white"
            onPress={() =>
              updateQuantity(item.product.codProd, item.quantity - 1)
            }
          >
            <AssetIcon color="#F08510" name="minus" size={18} />
          </TouchableOpacity>
          <Text className="min-w-12 text-center text-base font-semibold text-[#333333]">
            {item.quantity}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            className="h-9 w-9 items-center justify-center rounded-full bg-[#F08510]"
            onPress={() =>
              updateQuantity(item.product.codProd, item.quantity + 1)
            }
          >
            <AssetIcon color="#FFFFFF" name="add" size={18} />
          </TouchableOpacity>
        </View>

        <Text className="text-base font-bold text-[#333333]">
          {formatCurrency(item.product.vlrVenda * item.quantity)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white px-5 pt-5">
      <View className="mb-5 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-[#333333]">
            Meu Carrinho
          </Text>
          <Text className="mt-1 text-sm font-medium text-[#666666]">
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="rounded-full bg-[#F1F2F4] px-4 py-2"
          disabled={items.length === 0}
          onPress={handleClearCart}
        >
          <Text
            className={`text-sm font-semibold ${
              items.length === 0 ? "text-[#999999]" : "text-[#C62828]"
            }`}
          >
            Esvaziar
          </Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ShoppingCartEmpty />
          <Text className="mt-4 text-lg font-semibold text-[#333333]">
            Seu carrinho esta vazio
          </Text>
          <Text className="mt-2 text-center text-sm font-medium text-[#666666]">
            Adicione produtos para montar seu pedido.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          renderItem={renderItem}
        />
      )}

      <View
        className="border-t border-[#E8E8E8] bg-white pt-4"
        style={{ paddingBottom: bottomPanelInset }}
      >
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-[#666666]">
            Limite disponivel
          </Text>
          <Text className="text-base font-bold text-[#333333]">
            {isFetchingCreditLimit
              ? "Consultando..."
              : availableLimit === null
                ? "Indisponivel"
                : formatCurrency(availableLimit)}
          </Text>
        </View>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-base font-medium text-[#333333]">Total</Text>
          <Text className="text-2xl font-bold text-[#F08510]">
            {formatCurrency(total)}
          </Text>
        </View>
        {isOverLimit && (
          <Text className="mb-3 text-sm font-semibold text-[#C62828]">
            Total acima do limite disponivel.
          </Text>
        )}
        <Button
          title={
            isSubmitting
              ? "Enviando..."
              : isOverLimit
                ? "Limite insuficiente"
                : "Realizar pedido"
          }
          disabled={
            items.length === 0 ||
            isSubmitting ||
            isFetchingCreditLimit ||
            isLimitUnavailable ||
            isOverLimit
          }
          onPress={handleSubmitOrder}
        />
      </View>
      <OrderFeedbackModal
        feedback={feedback}
        onClose={() => setFeedback(null)}
        onContinueShopping={() => {
          setFeedback(null);
          router.replace("/home");
        }}
      />
    </SafeAreaView>
  );
}

function ShoppingCartEmpty() {
  return (
    <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F1F2F4]">
      <Text className="text-3xl font-bold text-[#F08510]">0</Text>
    </View>
  );
}

type OrderFeedbackModalProps = {
  feedback: OrderFeedback | null;
  onClose: () => void;
  onContinueShopping: () => void;
};

function OrderFeedbackModal({
  feedback,
  onClose,
  onContinueShopping,
}: OrderFeedbackModalProps) {
  const isSuccess = feedback?.kind === "success";

  return (
    <Modal
      animationType="fade"
      transparent
      visible={Boolean(feedback)}
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full rounded-xl bg-white p-6">
          <View
            className={`mb-5 h-14 w-14 items-center justify-center rounded-full ${
              isSuccess ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Text
              className={`text-lg font-bold ${
                isSuccess ? "text-green-700" : "text-red-700"
              }`}
            >
              {isSuccess ? "OK" : "!"}
            </Text>
          </View>

          <Text className="text-2xl font-bold text-[#333333]">
            {feedback?.title}
          </Text>
          <Text className="mt-2 text-base font-medium text-[#666666]">
            {feedback?.message}
          </Text>

          {isSuccess && (
            <View className="my-5 rounded-lg bg-[#F1F2F4] p-4">
              {feedback?.sankhyaOrderId && (
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-sm font-medium text-[#666666]">
                    Pedido Sankhya
                  </Text>
                  <Text className="text-base font-bold text-[#333333]">
                    #{feedback.sankhyaOrderId}
                  </Text>
                </View>
              )}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-[#666666]">
                  Protocolo
                </Text>
                <Text className="text-base font-bold text-[#333333]">
                  #{feedback?.orderIntegrationId}
                </Text>
              </View>
            </View>
          )}

          <Button
            title={isSuccess ? "Continuar comprando" : "Entendi"}
            onPress={isSuccess ? onContinueShopping : onClose}
          />
          {isSuccess && (
            <TouchableOpacity
              activeOpacity={0.8}
              className="mt-3 h-11 items-center justify-center"
              onPress={onClose}
            >
              <Text className="text-base font-semibold text-[#666666]">
                Ficar no carrinho
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
