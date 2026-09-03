import { useEffect } from "react";
import { router } from "expo-router";

import { Loading } from "@/components/loading";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    router.replace(isAuthenticated ? "/home" : "/login");
  }, [isAuthenticated, isLoading]);

  return <Loading />;
}
