import { SOCKET_URL } from "@/services/url.service";
import {
  addMessage,
  setLastMessage,
  setUnreadCount,
  updateMessageStatus,
  updateTypingStatus,
  updateUserStatus,
} from "@/store/slices/chatSlice";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = ({
  userId,
  conversationId,
  dispatch,
}: {
  userId: string;
  conversationId: string;
  dispatch?: any;
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
      socketRef.current.on("receive-message", (data) => {
        dispatch(addMessage(data));
      });
      socketRef.current.on("typing-start-notification", (data) => {
        dispatch(updateTypingStatus({ ...data, isTyping: true }));
      });

      socketRef.current.on("typing-stop-notification", (data) => {
        dispatch(updateTypingStatus({ ...data, isTyping: false }));
      });
      socketRef.current.on("user-status", (data) => {
        dispatch(updateUserStatus(data));
        dispatch(updateMessageStatus(data.messageSeen));
      });
      socketRef.current.on("message-seen", (data) => {
      });
      socketRef.current.on("unread-count-update", (data) => {
        dispatch(setUnreadCount(data));
      });
      socketRef.current.on("last-message", (data) => {
        dispatch(setLastMessage(data));
      });
    }
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      console.log("❌ Disconnected from socket server");
    };
  }, [userId, conversationId, dispatch]);

  return socketRef;
};
