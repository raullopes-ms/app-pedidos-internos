const API_PATH = "/api";

function getDefaultApiBaseUrl() {
  return "https://backend-pedidos-internos.onrender.com/api";
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? getDefaultApiBaseUrl();

export function buildApiUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;

  if (normalizedPath === API_PATH || normalizedPath.startsWith(`${API_PATH}/`)) {
    return `${API_BASE_URL.replace(new RegExp(`${API_PATH}$`), "")}${normalizedPath}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

type RequestOptions = RequestInit & {
  token?: string | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
  }
}

export async function apiFetch<TResponse>(
  path: string,
  { token, headers, ...options }: RequestOptions = {},
) {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data
        ? String(data.error)
        : typeof data === "object" && data !== null && "message" in data
          ? String(data.message)
          : "Não foi possível concluir a requisição.";

    throw new ApiError(message, response.status, data);
  }

  return data as TResponse;
}
