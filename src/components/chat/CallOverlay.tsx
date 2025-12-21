import { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CallOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  remoteUser: {
    name: string;
    image?: string;
  };
  callType: "audio" | "video";
}

const CallOverlay = ({ isOpen, onClose, remoteUser, callType }: CallOverlayProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent text-white">
        <div className="flex items-center gap-2">
          <span className="bg-red-500 w-2 h-2 rounded-full animate-pulse" />
          <span className="font-medium tracking-wide">{formatDuration(duration)}</span>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-zinc-900">
        {/* Remote User Video/Avatar */}
        {isVideoOff ? (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-500">
            <Avatar className="w-32 h-32 md:w-48 md:h-48 border-4 border-primary/20 shadow-2xl">
              <AvatarImage src={remoteUser.image} />
              <AvatarFallback className="text-4xl md:text-6xl bg-muted">
                {remoteUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                {remoteUser.name}
              </h2>
              <p className="text-white/60 animate-pulse">
                {isMuted ? "Remote user is muted" : "Connected..."}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-zinc-800 relative">
             {/* Placeholder for Remote Video Stream */}
             <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                <span className="text-lg">Remote Video Stream</span>
             </div>
             {/* Gradient Overlay for Controls visibility */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
          </div>
        )}

        {/* Local User PiP (Picture in Picture) */}
        {!isVideoOff && (
          <div className="absolute bottom-24 right-4 w-32 h-48 md:w-48 md:h-72 bg-black rounded-xl border border-white/10 shadow-2xl overflow-hidden cursor-move hover:scale-105 transition-transform duration-300">
             {/* Placeholder for Local Video Stream */}
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <span className="text-xs text-zinc-500">You</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="p-8 pb-10 flex justify-center items-center gap-4 md:gap-8 bg-zinc-900">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>

        <Button
          variant={isVideoOff ? "destructive" : "secondary"}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110"
          onClick={() => setIsVideoOff(!isVideoOff)}
        >
          {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          className="h-16 w-16 rounded-full shadow-xl hover:scale-110 bg-red-600 hover:bg-red-700"
          onClick={onClose}
        >
          <PhoneOff className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};

export default CallOverlay;
