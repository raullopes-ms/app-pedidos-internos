import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type DataRefreshContextValue = {
  refreshVersion: number;
  requestDataRefresh: () => void;
};

const DataRefreshContext = createContext<DataRefreshContextValue | null>(null);

export function DataRefreshProvider({ children }: PropsWithChildren) {
  const [refreshVersion, setRefreshVersion] = useState(0);

  const requestDataRefresh = useCallback(() => {
    setRefreshVersion((currentVersion) => currentVersion + 1);
  }, []);

  const value = useMemo(
    () => ({
      refreshVersion,
      requestDataRefresh,
    }),
    [refreshVersion, requestDataRefresh],
  );

  return (
    <DataRefreshContext.Provider value={value}>
      {children}
    </DataRefreshContext.Provider>
  );
}

export function useDataRefresh() {
  const context = useContext(DataRefreshContext);

  if (!context) {
    throw new Error("useDataRefresh must be used within a DataRefreshProvider");
  }

  return context;
}
