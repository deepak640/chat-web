let peer: RTCPeerConnection | null = null;

export const setPeer = (pc: RTCPeerConnection) => {
  peer = pc;
};

export const getPeer = (): RTCPeerConnection => {
  if (!peer) {
    throw new Error("RTCPeerConnection not initialized");
  }
  return peer;
};

export const clearPeer = () => {
  peer?.close();
  peer = null;
};
