import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_NAME_KEY = "auth_user_name";
const AUTH_CUSTOMER_TYPE_KEY = "auth_customer_type";

export type CustomerType = "FISICA" | "JURIDICA";

export function saveAuthToken(token: string) {
  return SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

export function getAuthToken() {
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export function deleteAuthToken() {
  return SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

export async function saveAuthSession(
  token: string,
  userName: string,
  customerType: CustomerType,
) {
  await Promise.all([
    SecureStore.setItemAsync(AUTH_TOKEN_KEY, token),
    SecureStore.setItemAsync(AUTH_USER_NAME_KEY, userName),
    SecureStore.setItemAsync(AUTH_CUSTOMER_TYPE_KEY, customerType),
  ]);
}

type AuthSession = {
  customerType: CustomerType | null;
  token: string | null;
  userName: string | null;
};

export async function getAuthSession(): Promise<AuthSession> {
  const [token, userName, customerType] = await Promise.all([
    SecureStore.getItemAsync(AUTH_TOKEN_KEY),
    SecureStore.getItemAsync(AUTH_USER_NAME_KEY),
    SecureStore.getItemAsync(AUTH_CUSTOMER_TYPE_KEY),
  ]);

  const parsedCustomerType: CustomerType | null =
    customerType === "FISICA" || customerType === "JURIDICA"
      ? customerType
      : null;

  return { customerType: parsedCustomerType, token, userName };
}

export async function deleteAuthSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
    SecureStore.deleteItemAsync(AUTH_USER_NAME_KEY),
    SecureStore.deleteItemAsync(AUTH_CUSTOMER_TYPE_KEY),
  ]);
}
