import { createPeerConnection } from "./peer";
import { setPeer } from "./peer.state";
import { getLocalStream } from "./media";

export const startCall = async (socket, toUserId) => {
  const peer = createPeerConnection();
  const localStream = await getLocalStream();
  setPeer(peer);
  localStream
    .getTracks()
    .forEach((track) => peer.addTrack(track, localStream!));

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        toUserId,
        candidate: event.candidate,
      });
    }
  };

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  socket.emit("call-user", { toUserId, offer });

  return { peer, localStream };
};

export const acceptCall = async (socket, fromUserId, offer) => {
  const peer = createPeerConnection();
  const localStream = await getLocalStream();
  setPeer(peer);
  localStream
    .getTracks()
    .forEach((track) => peer.addTrack(track, localStream!));

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        toUserId: fromUserId,
        candidate: event.candidate,
      });
    }
  };

  await peer.setRemoteDescription(offer);
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  socket.emit("accept-call", {
    toUserId: fromUserId,
    answer,
  });

  return { peer, localStream };
};

