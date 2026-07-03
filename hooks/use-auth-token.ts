import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/store";

export function useAuthToken() {
  const [mounted, setMounted] = useState(false);
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? token : null;
}
