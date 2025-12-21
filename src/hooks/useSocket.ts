import { SOCKET_URL } from "@/services/url.service";
import {
  addMessage,
  setLastMessage,
  setOnlineUsers,
  updateMessageStatus,
  updateTypingStatus,
  updateUnreadCount,
  updateUserStatus,
} from "@/store/slices/chatSlice";
import { clearPeer, getPeer } from "@/webrtc/peer.state";
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

    socketRef.current.on("online-users", ({ users }) => {
      dispatch(setOnlineUsers(users));
    });

    socketRef.current.on("last-message", (data) => {
      dispatch(setLastMessage(data.lastMessage));
    });
    socketRef.current.on("unread-count-update", (data) => {
      dispatch(updateUnreadCount(data));
    });

    // Video calling handlers can be added here
    socketRef.current.on("incoming-call", ({ fromUserId, offer }) => {
      // show incoming call UI
    });

    socketRef.current.on("call-accepted", async ({ answer }) => {
      const peer = getPeer();
      await peer.setRemoteDescription(answer);
    });

    socketRef.current.on("ice-candidate", async ({ candidate }) => {
      const peer = getPeer();
      await peer.addIceCandidate(candidate);
    });

    socketRef.current.on("call-ended", () => {
      clearPeer();
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
