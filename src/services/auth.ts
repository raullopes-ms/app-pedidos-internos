import { apiFetch } from "./api";

type AuthenticateRequest = {
  documento: string;
  senha: string;
};

type AuthenticateResponse = {
  nomeCliente: string;
  tipoCliente: "FISICA" | "JURIDICA";
  token: string;
  sankhyaAuthenticated: boolean;
};

export function authenticate({ documento, senha }: AuthenticateRequest) {
  return apiFetch<AuthenticateResponse>("/auth", {
    method: "POST",
    body: JSON.stringify({
      documento,
      senha,
    }),
  });
}
