import { apiFetch } from "./api";

type CreditLimitResponse = {
  availableLimit: number;
};

export function getCreditLimit(token: string) {
  return apiFetch<CreditLimitResponse>("/credit-limit", {
    method: "GET",
    token,
  });
}
