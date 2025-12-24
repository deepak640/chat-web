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
import { setIncomingCall, endCallSession, callAccepted } from "@/store/slices/callSlice";
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

    // WebRTC handlers
    const pendingCandidates: RTCIceCandidateInit[] = [];

    socketRef.current.on("incoming-call", ({ fromUser, offer }) => {
      pendingCandidates.length = 0; // Clear on new call
      dispatch(setIncomingCall({ offer, fromUser }));
    });

    socketRef.current.on("call-accepted", async ({ answer }) => {
      console.log("Call accepted, setting remote description...");
      dispatch(callAccepted()); // <--- Add this line to update the UI state
      try {
        const peer = getPeer();
        if (peer && peer.signalingState !== "stable") {
          await peer.setRemoteDescription(new RTCSessionDescription(answer));
          // Process any pending candidates
          while (pendingCandidates.length > 0) {
            const candidate = pendingCandidates.shift();
            if (candidate) await peer.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
      } catch (error) {
        console.error("Error in call-accepted:", error);
      }
    });

    socketRef.current.on("ice-candidate", async ({ candidate }) => {
      try {
        const peer = getPeer();
        if (peer && peer.remoteDescription && peer.remoteDescription.type) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingCandidates.push(candidate);
        }
      } catch (error) {
        // If peer is not initialized yet, queue it
        if (candidate) {
          pendingCandidates.push(candidate);
        }
      }
    });

    socketRef.current.on("call-ended", () => {
      pendingCandidates.length = 0;
      clearPeer();
      dispatch(endCallSession());
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
