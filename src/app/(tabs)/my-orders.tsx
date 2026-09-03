import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Loading } from "@/components/loading";
import { useAuth } from "@/contexts/AuthContext";
import { useDataRefresh } from "@/contexts/DataRefreshContext";
import { ApiError } from "@/services/api";
import {
  listOrderItems,
  listOrders,
  type PartnerOrder,
  type PartnerOrderItem,
} from "@/services/orders";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

function formatDate(value: string) {
  const sankhyaDateMatch = value.match(/^(\d{2})(\d{2})(\d{4})/);

  if (sankhyaDateMatch) {
    const [, day, month, year] = sankhyaDateMatch;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function getStatusLabel(status: string) {
  const normalizedStatus = status.trim().toUpperCase();

  const labels: Record<string, string> = {
    A: "Atendimento",
    L: "Liberado",
    P: "Pendente",
  };

  const fallbackStatus = normalizedStatus || "Sem status";

  return labels[normalizedStatus] ?? fallbackStatus;
}

function keyExtractor(item: PartnerOrder) {
  return String(item.numeroUnico);
}

function itemKeyExtractor(item: PartnerOrderItem) {
  return String(item.sequenciaItem);
}

function EmptyOrders() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-lg font-semibold text-[#333333]">
        Nenhum pedido encontrado
      </Text>
      <Text className="mt-2 text-center text-sm font-medium text-[#666666]">
        Seus pedidos feitos aparecerão aqui.
      </Text>
    </View>
  );
}

export default function MyOrders() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading, signOut, token } = useAuth();
  const { refreshVersion } = useDataRefresh();
  const [orders, setOrders] = useState<PartnerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PartnerOrder | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<
    PartnerOrderItem[]
  >([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(true);
  const [isFetchingOrderItems, setIsFetchingOrderItems] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const bottomContentInset = Math.max(insets.bottom, 16) + 88;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);

  const fetchOrders = useCallback(
    async (refreshing = false) => {
      if (!token) {
        return;
      }

      try {
        setError(null);
        refreshing ? setIsRefreshing(true) : setIsFetchingOrders(true);

        const response = await listOrders(token);
        setOrders(response.orders);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          await signOut();
          router.replace("/login");
          return;
        }

        setError("Nao foi possivel carregar seus pedidos.");
      } finally {
        refreshing ? setIsRefreshing(false) : setIsFetchingOrders(false);
      }
    },
    [signOut, token],
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [fetchOrders, isAuthenticated, refreshVersion]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        colors={["#F08510"]}
        refreshing={isRefreshing}
        tintColor="#F08510"
        onRefresh={() => fetchOrders(true)}
      />
    ),
    [fetchOrders, isRefreshing],
  );

  const handleOpenOrderDetails = useCallback(
    async (order: PartnerOrder) => {
      if (!token) {
        return;
      }

      try {
        setSelectedOrder(order);
        setSelectedOrderItems([]);
        setDetailsError(null);
        setIsFetchingOrderItems(true);

        const response = await listOrderItems(order.numeroUnico, token);
        setSelectedOrderItems(response.items);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          await signOut();
          router.replace("/login");
          return;
        }

        setDetailsError("Nao foi possivel carregar os detalhes do pedido.");
      } finally {
        setIsFetchingOrderItems(false);
      }
    },
    [signOut, token],
  );

  const handleCloseOrderDetails = useCallback(() => {
    setSelectedOrder(null);
    setSelectedOrderItems([]);
    setDetailsError(null);
  }, []);

  const renderOrder = useCallback(
    ({ item }: { item: PartnerOrder }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        className="rounded-lg border border-[#E8E8E8] bg-white p-4"
        onPress={() => handleOpenOrderDetails(item)}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-[#333333]">
              Pedido #{item.numeroUnico}
            </Text>
            <Text className="mt-1 text-sm font-medium text-[#666666]">
              Data: {formatDate(item.dataNegociacao)}
            </Text>
          </View>

          <View className="rounded-full bg-[#F1F2F4] px-3 py-1">
            <Text className="text-xs font-bold text-[#F08510]">
              {getStatusLabel(item.statusNota)}
            </Text>
          </View>
        </View>

        <View className="mt-4 border-t border-[#E8E8E8] pt-3">
          <Text className="text-sm font-medium text-[#666666]">
            Valor total
          </Text>
          <Text className="mt-1 text-2xl font-bold text-[#F08510]">
            {formatCurrency(item.valorTotal)}
          </Text>
        </View>
        <Text className="mt-3 text-sm font-semibold text-[#F08510]">
          Ver detalhes
        </Text>
      </TouchableOpacity>
    ),
    [handleOpenOrderDetails],
  );

  if (isLoading || !isAuthenticated) {
    return <Loading />;
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white px-5 pt-5">
      <Text className="text-2xl font-bold text-[#333333]">Meus Pedidos</Text>
      <Text className="mb-5 mt-1 text-sm font-medium text-[#666666]">
        Acompanhe seus pedidos realizados.
      </Text>

      {error && (
        <Text className="mb-4 text-sm font-medium text-red-600">{error}</Text>
      )}

      {isFetchingOrders ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#F08510" />
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={orders}
          keyExtractor={keyExtractor}
          contentContainerStyle={{
            flexGrow: 1,
            gap: 12,
            paddingBottom: bottomContentInset,
          }}
          refreshControl={refreshControl}
          renderItem={renderOrder}
          ListEmptyComponent={EmptyOrders}
        />
      )}
      <OrderDetailsModal
        detailsError={detailsError}
        isLoading={isFetchingOrderItems}
        items={selectedOrderItems}
        order={selectedOrder}
        onClose={handleCloseOrderDetails}
      />
    </SafeAreaView>
  );
}

type OrderDetailsModalProps = {
  detailsError: string | null;
  isLoading: boolean;
  items: PartnerOrderItem[];
  order: PartnerOrder | null;
  onClose: () => void;
};

function OrderDetailsModal({
  detailsError,
  isLoading,
  items,
  order,
  onClose,
}: OrderDetailsModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={Boolean(order)}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[85%] rounded-t-2xl bg-white px-6 pb-8 pt-5">
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-bold text-[#333333]">
                Pedido #{order?.numeroUnico}
              </Text>
              <Text className="mt-1 text-sm font-medium text-[#666666]">
                {order ? formatDate(order.dataNegociacao) : "-"} |{" "}
                {order ? formatCurrency(order.valorTotal) : "-"}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              className="rounded-full bg-[#F1F2F4] px-4 py-2"
              onPress={onClose}
            >
              <Text className="text-sm font-semibold text-[#666666]">
                Fechar
              </Text>
            </TouchableOpacity>
          </View>

          {detailsError && (
            <Text className="mb-4 text-sm font-medium text-red-600">
              {detailsError}
            </Text>
          )}

          {isLoading ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator color="#F08510" />
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={itemKeyExtractor}
              contentContainerStyle={{ gap: 10, paddingBottom: 8 }}
              ListEmptyComponent={
                <Text className="py-10 text-center text-sm font-medium text-[#666666]">
                  Nenhum item encontrado para este pedido.
                </Text>
              }
              renderItem={({ item }) => (
                <View className="rounded-lg bg-[#F7F7F7] p-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text
                        className="text-base font-semibold text-[#333333]"
                        numberOfLines={2}
                      >
                        {item.descricaoProduto}
                      </Text>
                      <Text className="mt-1 text-xs font-medium text-[#666666]">
                        Cod. {item.codigoProduto} | Seq. {item.sequenciaItem}
                      </Text>
                    </View>
                    <Text className="text-sm font-bold text-[#F08510]">
                      x{item.quantidade}
                    </Text>
                  </View>

                  <View className="mt-3 flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-[#666666]">
                      Unit. {formatCurrency(item.valorUnitario)}
                    </Text>
                    <Text className="text-base font-bold text-[#333333]">
                      {formatCurrency(item.valorTotalItem)}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
