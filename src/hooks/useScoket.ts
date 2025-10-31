import { SOCKET_URL } from "@/services/url.service";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = ({
  userId,
  conversationId,
}: {
  userId: string;
  conversationId: string;
}) => {
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    if (userId && !socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        query: { userId, conversationId },
        withCredentials: true,
        transports: ["websocket"],
      });
      socketRef.current.on("connect", () => {
        console.log("🔌 Connected to socket server");
      });
    }
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      console.log("❌ Disconnected from socket server");
    };
  }, [userId, conversationId]);

  return socketRef;
};
