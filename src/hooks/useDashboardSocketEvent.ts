import { useEffect, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";

import { getDashboardSocket } from "@/api/socket";
import { useAuthStore } from "@/stores/authStore";

export function useDashboardSocketEvent(
  eventName: "queue:changed" | "pharmacy:changed",
  onEvent: (payload: unknown) => void | Promise<void>,
  delay = 300,
) {
  const isFocused = useIsFocused();
  const token = useAuthStore((state) => state.token);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!isFocused || !token) return undefined;

    const socket = getDashboardSocket(token);
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const handleEvent = (payload: unknown) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        void onEventRef.current(payload);
      }, delay);
    };

    socket.on(eventName, handleEvent);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      socket.off(eventName, handleEvent);
    };
  }, [delay, eventName, isFocused, token]);
}
