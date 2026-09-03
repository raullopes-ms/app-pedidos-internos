import type { CartItem } from "@/contexts/CartContext";

import { apiFetch } from "./api";

type CreateOrderResponse = {
  orderIntegrationId: number;
  sankhyaOrderId: number | null;
  status: string;
};

export type PartnerOrder = {
  numeroUnico: number;
  dataNegociacao: string;
  valorTotal: number;
  statusNota: string;
};

export type PartnerOrderItem = {
  numeroUnico: number;
  sequenciaItem: number;
  codigoProduto: number;
  descricaoProduto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotalItem: number;
};

type ListOrdersResponse = {
  orders: PartnerOrder[];
};

type ListOrderItemsResponse = {
  items: PartnerOrderItem[];
};

export function createOrder(items: CartItem[], token: string) {
  return apiFetch<CreateOrderResponse>("/orders", {
    method: "POST",
    token,
    body: JSON.stringify({
      items: items.map((item) => ({
        codProd: item.product.codProd,
        codVol: item.product.codVol,
        quantidade: item.quantity,
        vlrUnit: item.product.vlrVenda,
      })),
    }),
  });
}

export function listOrders(token: string) {
  return apiFetch<ListOrdersResponse>("/orders", {
    method: "GET",
    token,
  });
}

export function listOrderItems(numeroUnico: number, token: string) {
  return apiFetch<ListOrderItemsResponse>(`/orders/${numeroUnico}/items`, {
    method: "GET",
    token,
  });
}
