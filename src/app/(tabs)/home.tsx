import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";

import { AddToCartModal } from "@/components/AddToCartModal";
import { Header } from "@/components/Header";
import { Loading } from "@/components/loading";
import { ProductCard } from "@/components/ProductCard";
import { Search } from "@/components/Search";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useDataRefresh } from "@/contexts/DataRefreshContext";
import { ApiError, buildApiUrl } from "@/services/api";
import { getCreditLimit } from "@/services/creditLimit";
import { listProducts, type Product } from "@/services/products";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

function getProductImage(product: Product, token: string) {
  const image = product.image ?? product.imageUrl;

  if (!image) {
    return undefined;
  }

  if (image.startsWith("data:")) {
    return { uri: image };
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    uri: buildApiUrl(image),
  };
}

function keyExtractor(item: Product) {
  return String(item.codProd);
}

function EmptyProducts() {
  return (
    <Text className="mt-8 text-center text-sm font-medium text-[#666666]">
      Nenhum produto encontrado.
    </Text>
  );
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading, signOut, token, userName } = useAuth();
  const { addItem } = useCart();
  const { refreshVersion } = useDataRefresh();
  const bottomContentInset = Math.max(insets.bottom, 16) + 88;
  const [products, setProducts] = useState<Product[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [isFetchingCreditLimit, setIsFetchingCreditLimit] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availableLimit, setAvailableLimit] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);

  const fetchProducts = useCallback(
    async (refreshing = false) => {
      if (!token) {
        return;
      }

      try {
        setError(null);
        refreshing ? setIsRefreshing(true) : setIsFetchingProducts(true);

        const response = await listProducts(token);
        setProducts(response.products);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          await signOut();
          router.replace("/login");
          return;
        }

        setError("Nao foi possivel carregar os produtos.");
      } finally {
        refreshing ? setIsRefreshing(false) : setIsFetchingProducts(false);
      }
    },
    [signOut, token],
  );

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
        router.replace("/login");
        return;
      }

      setAvailableLimit(null);
    } finally {
      setIsFetchingCreditLimit(false);
    }
  }, [signOut, token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchCreditLimit();
    }
  }, [fetchCreditLimit, fetchProducts, isAuthenticated, refreshVersion]);

  const handleRefresh = useCallback(() => {
    fetchProducts(true);
    fetchCreditLimit();
  }, [fetchCreditLimit, fetchProducts]);

  const handleLogout = useCallback(async () => {
    await signOut();
    router.replace("/login");
  }, [signOut]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        colors={["#F08510"]}
        refreshing={isRefreshing}
        tintColor="#F08510"
        onRefresh={handleRefresh}
      />
    ),
    [handleRefresh, isRefreshing],
  );

  const renderProduct = useCallback<ListRenderItem<Product>>(
    ({ item }) => (
      <ProductCard
        description={item.descrProd}
        image={token ? getProductImage(item, token) : undefined}
        onAddToCart={() => setSelectedProduct(item)}
        price={formatCurrency(item.vlrVenda)}
        vol={`${item.codVol}`}
        codprod={`${item.codProd}`}
      />
    ),
    [token],
  );

  const handleCloseCartModal = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const handleAddToCart = useCallback(
    (product: Product, quantity: number) => {
      addItem(product, quantity);
      setSelectedProduct(null);
    },
    [addItem],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(search);

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const searchableText = normalizeSearchValue(
        [
          product.codProd,
          product.descrProd,
          product.codVol,
          product.vlrVenda,
        ].join(" "),
      );

      return searchableText.includes(normalizedSearch);
    });
  }, [products, search]);

  if (isLoading || !isAuthenticated) {
    return <Loading />;
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white px-5 pt-5">
      <Header
        availableLimit={availableLimit}
        isLoadingLimit={isFetchingCreditLimit}
        name={userName}
        onLogout={handleLogout}
      />
      <Text className="mb-4 mt-6 text-xl font-medium text-[#333333]">
        Produtos
      </Text>
      <View className="mb-4">
        <Search value={search} onChangeText={setSearch} />
      </View>
      {error && (
        <Text className="mb-4 text-sm font-medium text-red-600">{error}</Text>
      )}
      {isFetchingProducts ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#F08510" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{ gap: 10, paddingBottom: bottomContentInset }}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          removeClippedSubviews
          updateCellsBatchingPeriod={50}
          windowSize={5}
          refreshControl={refreshControl}
          renderItem={renderProduct}
          ListEmptyComponent={EmptyProducts}
          ListFooterComponent={<View className="w-0" />}
        />
      )}
      <AddToCartModal
        product={selectedProduct}
        visible={Boolean(selectedProduct)}
        onClose={handleCloseCartModal}
        onConfirm={handleAddToCart}
      />
    </SafeAreaView>
  );
}
