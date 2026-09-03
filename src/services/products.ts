import { apiFetch } from "./api";

export type Product = {
  codProd: number;
  descrProd: string;
  estoque: number;
  codVol: string;
  vlrVenda: number;
  image?: string;
  imageUrl?: string;
};

type ListProductsResponse = {
  products: Product[];
};

export function listProducts(token: string) {
  return apiFetch<ListProductsResponse>("/products", {
    method: "GET",
    token,
  });
}
