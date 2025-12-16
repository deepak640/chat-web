import { SOCKET_URL } from "@/services/url.service";
import {
  addMessage,
  setLastMessage,
  updateMessageStatus,
  updateTypingStatus,
  updateUnreadCount,
  updateUserStatus,
} from "@/store/slices/chatSlice";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = ({
  userId,
  dispatch,
}: {
  userId?: string;
  dispatch: any;
}) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId || socketRef.current) return;

    socketRef.current = io(SOCKET_URL, {
      query: { userId },
      withCredentials: true,
      transports: ["websocket"],
    });

    (window as any).socket = socketRef.current;

    socketRef.current.on("connect", () => {
      console.log("🔌 Global socket connected");
    });

    socketRef.current.on("receive-message", (data) => {
      dispatch(addMessage(data));
    });

    socketRef.current.on("message-seen", (data) => {
      dispatch(updateMessageStatus(data));
    });

    socketRef.current.on("typing-start", (data) => {
      dispatch(updateTypingStatus({ ...data, isTyping: true }));
    });

    socketRef.current.on("typing-stop", (data) => {
      dispatch(updateTypingStatus({ ...data, isTyping: false }));
    });

    socketRef.current.on("global-user-status", (data) => {
      dispatch(updateUserStatus(data));
    });

    socketRef.current.on("last-message", (data) => {
      dispatch(setLastMessage(data.lastMessage));
    });
    socketRef.current.on("unread-count-update", (data) => {
      dispatch(updateUnreadCount(data));
    });
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      delete (window as any).socket;
      console.log("❌ Global socket disconnected");
    };
  }, [userId]);

  return socketRef;
};
