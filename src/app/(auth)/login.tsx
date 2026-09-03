import { useState } from "react";
import { router } from "expo-router";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AssetIcon } from "@/components/AssetIcon";
import { AuthAlert } from "@/components/AuthAlert";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/api";

export function formatarCpfCnpj(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 14);

  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export default function Login() {
  const [documento, setDocumento] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  const handleDocumento = (text: string) => {
    const somenteNumeros = text.replace(/\D/g, "").slice(0, 14);
    setDocumento(somenteNumeros);
  };

  async function handleLogin() {
    if (!documento || !senha) {
      setError("Informe documento e senha para entrar.");
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await signIn({ documento, senha });
      router.replace("/home");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }

      setError("Nao foi possivel conectar a API. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FFF7EF]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="min-h-[288px] justify-end rounded-b-[28px] bg-[#F08510] px-6 pb-10 pt-8">
            <View className="mb-7 h-24 w-48 justify-center rounded-2xl bg-white px-5 shadow-sm">
              <Image
                source={require("../../assets/logo.png")}
                className="h-16 w-full"
                resizeMode="contain"
              />
            </View>
            <Text className="mt-3 max-w-[300px] text-xl font-medium leading-6 text-white/90">
              Acesse sua conta para consultar produtos e acompanhar seus pedidos.
            </Text>
          </View>

          <View className="flex-1 px-6 pb-5">
            <View
              className="-mt-5 rounded-2xl border border-[#F2D7BD] bg-white p-5"
              style={{
                elevation: 4,
                shadowColor: "#B76A21",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.08,
                shadowRadius: 18,
              }}
            >
              <View className="mb-6 flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0E2]">
                  <AssetIcon color="#F08510" name="loginCurve" size={23} />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-[#2B2B2B]">
                    Entrar
                  </Text>
                  <Text className="mt-1 text-sm font-medium text-[#777777]">
                    Informe seus dados de acesso
                  </Text>
                </View>
              </View>

              <View className="gap-5">
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-[#333333]">
                    Documento
                  </Text>
                  <View className="h-[54px] flex-row items-center rounded-xl border border-[#E7E2DC] bg-[#FAFAFA] px-4">
                    <AssetIcon color="#F08510" name="documentText" size={22} />
                    <TextInput
                      value={formatarCpfCnpj(documento)}
                      placeholder="CPF ou CNPJ"
                      keyboardType="numeric"
                      onChangeText={handleDocumento}
                      className="ml-3 flex-1 text-base font-medium text-[#222222]"
                      placeholderTextColor="#8A8A8A"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-semibold text-[#333333]">
                    Senha
                  </Text>
                  <View className="h-[54px] flex-row items-center rounded-xl border border-[#E7E2DC] bg-[#FAFAFA] px-4">
                    <AssetIcon color="#F08510" name="lock" size={22} />
                    <TextInput
                      value={senha}
                      placeholder="Sua senha"
                      secureTextEntry={!showPassword}
                      onChangeText={setSenha}
                      onSubmitEditing={handleLogin}
                      className="ml-3 flex-1 text-base font-medium text-[#222222]"
                      placeholderTextColor="#8A8A8A"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="go"
                    />
                    <Pressable
                      accessibilityLabel={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      className="h-10 w-10 items-center justify-center rounded-full"
                      onPress={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? (
                        <AssetIcon color="#666666" name="eyeSlash" size={21} />
                      ) : (
                        <AssetIcon color="#666666" name="eye" size={21} />
                      )}
                    </Pressable>
                  </View>
                </View>
                {error && <AuthAlert message={error} />}
                <Button
                  title={isSubmitting ? "Entrando..." : "Entrar"}
                  disabled={isSubmitting}
                  onPress={handleLogin}
                  className="mt-1"
                />
              </View>
            </View>
            <Text className="mt-auto pt-8 text-center text-xs font-medium text-[#8A8A8A]">
              Desenvolvido por Raul Lopes
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
