import { useEffect, useCallback, useState } from "react";
import * as SecureStore from "expo-secure-store";

export async function setTokenAsync(value) {
    if (value == null) {
      await SecureStore.deleteItemAsync('VAT_API_TOKEN');
    } else {
      await SecureStore.setItemAsync('VAT_API_TOKEN', value);
    }
}

export function useToken() {
  // Public
  const [token, setToken] = useState(null);

  // Get
  useEffect(() => {
      SecureStore.getItemAsync('VAT_API_TOKEN').then((value) => {
        setToken(value);
      });

  }, []);

  const setValue = useCallback(
    (value) => {
      setToken(value);
      setTokenAsync(value);
    },
    [],
  );

  return [token, setValue];
}