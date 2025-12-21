import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Paperclip,
  MoreVertical,
  Trash2,
  LogOut,
  Info,
  User,
  Loader2,
  FileIcon,
  X,
  Phone,
  Video,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MessageBubble from "./MessageBubble";
import CallOverlay from "./CallOverlay";
import { Message } from "@/types/chat";
import { useDispatch, useSelector } from "react-redux";
import { useGetUserById, useGetUserList } from "@/services/user.service";
import { uploadFile } from "@/services/chat.service";
import { RootState } from "@/store/store";
import { useGetConversationById } from "@/services/chat.service";
import { setMessages } from "@/store/slices/chatSlice";
import moment from "moment";
import { useToast } from "@/components/ui/use-toast";

// === Types ===

interface ChatWindowProps {
  onShowProfile: (userId: string) => void;
}

// === Component ===
const ChatWindow = ({ onShowProfile }: ChatWindowProps) => {
  const { toast } = useToast();
  const { activeChat, messages, typingStatus } = useSelector(
    (state: RootState) => state.chat
  );
  const userStatuses = useSelector(
    (state: RootState) => state.chat.userStatuses
  );
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { data: otherUser } = useGetUserById(
    activeChat?.participants.find((p: any) => p !== currentUser?._id)
  );
  const activeUserStatus = userStatuses ? userStatuses[otherUser?._id] : null;

  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollBottomRef = useRef<HTMLDivElement>(null);
  const lastChatIdRef = useRef<string | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Call State
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("audio");

  const { data: messagesHistory } = useGetConversationById(activeChat?._id);

  useEffect(() => {
    if (!messages || messages.length === 0 || !scrollBottomRef.current) return;

    const lastMsg = messages[messages.length - 1];
    const isNewChat = activeChat?._id !== lastChatIdRef.current;
    const isNewBottomMessage = lastMsg._id !== lastMessageIdRef.current;

    if (isNewChat) {
      scrollBottomRef.current.scrollIntoView({ behavior: "auto" });
      lastChatIdRef.current = activeChat?._id;
      lastMessageIdRef.current = lastMsg._id;
    } else if (isNewBottomMessage) {
      if (lastMsg.senderId === currentUser?._id) {
        scrollBottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
      lastMessageIdRef.current = lastMsg._id;
    }
  }, [messages, activeChat, currentUser]);

  useEffect(() => {
    if (messagesHistory && messagesHistory.length > 0) {
      dispatch(setMessages(messagesHistory));
    }
  }, [messagesHistory]);

  useEffect(() => {
    const socket = (window as any).socket;
    if (!socket || !activeChat?._id) return;
    socket.emit("join_chat", { conversationId: activeChat._id });

    return () => {
      socket.emit("leave_chat", { conversationId: activeChat._id });
    };
  }, [activeChat?._id]);
  const handleSend = async () => {
    const socket = (window as any).socket;

    if ((!message.trim() && !selectedFile) || isUploading) return;

    let fileData = {};

    if (selectedFile) {
      setIsUploading(true);
      try {
        const result = await uploadFile(selectedFile);

        let type = "file";
        if (selectedFile.type.startsWith("image/")) type = "image";
        else if (selectedFile.type.startsWith("video/")) type = "video";
        else if (selectedFile.type.startsWith("audio/")) type = "audio";

        fileData = {
          fileUrl: result.url,
          fileName: selectedFile.name,
          fileSize: (selectedFile.size / 1024).toFixed(2) + " KB",
          type,
        };
      } catch (error) {
        console.error("File upload failed:", error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    socket.emit("send-message", {
      conversationId: activeChat._id,
      content: message,
      senderId: currentUser?._id,
      ...fileData,
    });

    setMessage("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 50MB",
          variant: "destructive",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFile(file);
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-bg">
        <div className="text-center space-y-4 px-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Send className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Welcome to ChatApp</h2>
          <p className="text-muted-foreground max-w-md">
            Select a chat from the sidebar to start messaging, or find users to
            connect with.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-chat-bg relative">
      <CallOverlay
        isOpen={isCallActive}
        onClose={() => setIsCallActive(false)}
        callType={callType}
        remoteUser={{
          name: otherUser?.name || "User",
          image: otherUser?.photo,
        }}
      />
      {/* Header */}
      <div className="h-16 border-b border-border bg-card flex items-center px-4 justify-between shadow-sm">
        <button
          onClick={() => {
            onShowProfile(otherUser?._id);
          }}
          className="flex items-center gap-3 hover:bg-secondary/50 rounded-lg p-2 -ml-2 transition-colors"
        >
          {otherUser?.photo ? (
            <img
              src={otherUser?.photo || "https://i.pravatar.cc/40?img=3"}
              alt={otherUser?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
              {otherUser?.email ? (
                otherUser.email.charAt(0).toUpperCase()
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
          )}
          <div className="text-left">
            <h3 className="font-semibold">{otherUser?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {activeUserStatus?.status
                ? "Online"
                : (() => {
                    const lastActive = moment(activeUserStatus?.lastActive);
                    const now = moment();
                    const daysDiff = now.diff(lastActive, "days");
                    const monthsDiff = now.diff(lastActive, "months");

                    if (daysDiff === 0) {
                      return `Last seen at ${lastActive.format("h:mm A")}`;
                    } else if (daysDiff === 1) {
                      return `Last seen yesterday at ${lastActive.format(
                        "h:mm A"
                      )}`;
                    } else if (monthsDiff >= 1) {
                      return `Last seen at ${lastActive.format(
                        "MMMM D [at] h:mm A"
                      )}`;
                    } else {
                      return `Last seen ${lastActive.fromNow() || "offline"}`;
                    }
                  })()}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCallType("audio");
              setIsCallActive(true);
            }}
          >
            <Phone className="w-5 h-5" />
          </Button> */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCallType("video");
              setIsCallActive(true);
            }}
          >
            <Video className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  onShowProfile(otherUser?._id);
                }}
              >
                <Info className="w-4 h-4 mr-2" />
                View Info
              </DropdownMenuItem>
              {activeChat.type === "group" && (
                <DropdownMenuItem>
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Group
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 mx-5">
          {messages?.map((msg: Message, idx: number) => {
            const prevMsg = messages[idx - 1];
            const showAvatar = idx === 0 || prevMsg?.senderId !== msg.senderId;
            return (
              <MessageBubble
                key={idx}
                message={msg}
                sender={msg.sender}
                isOwn={msg.senderId === currentUser?._id}
                showAvatar={showAvatar}
              />
            );
          })}
          {typingStatus?.isTyping && (
            <div className="text-sm text-muted-foreground">
              {typingStatus.hashId} is typing...
            </div>
          )}
          <div ref={scrollBottomRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        {selectedFile && (
          <div className="mb-4 relative inline-block group">
            <div className="relative rounded-xl overflow-hidden border border-border bg-background/50">
              {selectedFile.type.startsWith("image/") ? (
                <div className="relative h-32 w-32">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : selectedFile.type.startsWith("video/") ? (
                <div className="h-32 w-32 bg-black/5 flex items-center justify-center">
                  <video
                    src={URL.createObjectURL(selectedFile)}
                    className="h-full w-full object-cover"
                    muted
                  />
                </div>
              ) : (
                <div className="h-20 w-48 flex items-center gap-3 p-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isUploading}
          />

          <Button
            onClick={handleSend}
            size="icon"
            disabled={(!message.trim() && !selectedFile) || isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
