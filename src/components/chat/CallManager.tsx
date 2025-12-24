import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  acceptIncomingCall,
  endCallSession,
  setIncomingCall,
} from "@/store/slices/callSlice";
import CallOverlay from "./CallOverlay";
import { startCall as initCall, acceptCall as answerCall } from "@/webrtc/call.handlers";
import { clearPeer, getPeer } from "@/webrtc/peer.state";
import { Socket } from "socket.io-client";

const CallManager = () => {
  const dispatch = useDispatch();
  const { isIncomingCall, isCallActive, offer, remoteUser, callType } = useSelector(
    (state: RootState) => state.call
  );
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const socket = (window as any).socket as Socket;

  // Handle stream attachment
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, localVideoRef.current]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, remoteVideoRef.current]);

  // Handle Outgoing Call Start
  useEffect(() => {
    if (isCallActive && !isIncomingCall && !localStream && remoteUser && socket) {
      const start = async () => {
        try {
          const { peer, localStream: stream } = await initCall(socket, remoteUser._id);
          setLocalStream(stream);
          
          peer.ontrack = (event) => {
            console.log("Remote track received", event.streams[0]);
            setRemoteStream(event.streams[0]);
          };
        } catch (error) {
          console.error("Failed to start call", error);
          dispatch(endCallSession());
        }
      };
      start();
    }
  }, [isCallActive, isIncomingCall, localStream, remoteUser, socket, dispatch]);

  const handleAcceptCall = async () => {
    if (!socket || !offer || !remoteUser) return;
    
    try {
      const { peer, localStream: stream } = await answerCall(socket, remoteUser._id, offer);
      
      peer.ontrack = (event) => {
        console.log("Remote track received (Answer)", event.streams[0]);
        setRemoteStream(event.streams[0]);
      };

      setLocalStream(stream);
      dispatch(acceptIncomingCall());
    } catch (error) {
      console.error("Failed to accept call", error);
      handleEndCall();
    }
  };

  const handleEndCall = () => {
    if (socket && remoteUser) {
      socket.emit("end-call", { toUserId: remoteUser._id });
    }
    clearPeer();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    dispatch(endCallSession());
  };

  if (!isIncomingCall && !isCallActive) return null;

  return (
    <CallOverlay
      isOpen={true}
      onClose={handleEndCall}
      onAccept={handleAcceptCall}
      remoteUser={remoteUser || { name: "Unknown", _id: "" }}
      callType={callType}
      isIncoming={isIncomingCall}
      localVideoRef={localVideoRef}
      remoteVideoRef={remoteVideoRef}
      hasRemoteStream={!!remoteStream}
    />
  );
};

export default CallManager;
