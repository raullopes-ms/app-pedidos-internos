import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authenticate } from "@/services/auth";
import {
  type CustomerType,
  deleteAuthSession,
  getAuthSession,
  saveAuthSession,
} from "@/services/authStorage";

type SignInCredentials = {
  documento: string;
  senha: string;
};

type AuthContextValue = {
  customerType: CustomerType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  token: string | null;
  userName: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [customerType, setCustomerType] = useState<CustomerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAuthSession()
      .then((session) => {
        setToken(session.token);
        setUserName(session.userName);
        setCustomerType(session.customerType);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async ({ documento, senha }: SignInCredentials) => {
    const response = await authenticate({ documento, senha });

    await saveAuthSession(
      response.token,
      response.nomeCliente,
      response.tipoCliente,
    );
    setToken(response.token);
    setUserName(response.nomeCliente);
    setCustomerType(response.tipoCliente);
  }, []);

  const signOut = useCallback(async () => {
    await deleteAuthSession();
    setToken(null);
    setUserName(null);
    setCustomerType(null);
  }, []);

  const value = useMemo(
    () => ({
      customerType,
      isAuthenticated: Boolean(token),
      isLoading,
      signIn,
      signOut,
      token,
      userName,
    }),
    [customerType, isLoading, signIn, signOut, token, userName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
