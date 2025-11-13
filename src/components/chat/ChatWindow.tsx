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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MessageBubble from "./MessageBubble";
import { Message } from "@/types/chat";
import { useDispatch, useSelector } from "react-redux";
import { useGetUserById, useGetUserList } from "@/services/user.service";
import { useSocket } from "@/hooks/useScoket";
import { RootState } from "@/store/store";
import { useGetConversationById } from "@/services/chat.service";
import { setMessages } from "@/store/slices/chatSlice";

// === Types ===

interface ChatWindowProps {
  onShowProfile: (userId: string) => void;
}

// === Component ===
const ChatWindow = ({ onShowProfile }: ChatWindowProps) => {
  const { activeChat, messages, typingStatus, userStatus } = useSelector(
    (state: RootState) => state.chat
  );
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const { data: otherUser } = useGetUserById(
    activeChat?.participants.find((p: any) => p !== currentUser?._id)
  );

  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const socket = useSocket({
    userId: currentUser?._id,
    conversationId: activeChat?._id,
    dispatch,
  });
  const { data: messagesHistory } = useGetConversationById(activeChat?._id);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    if (messagesHistory && messagesHistory.length > 0) {
      dispatch(setMessages(messagesHistory));
    }
    socket.current?.emit("message-seen", {
      conversationId: activeChat?._id,
      currentUserId: currentUser?._id,
    });
  }, [messagesHistory]);

  const handleSend = () => {
    if (!message.trim() && !selectedFile) return;
    if (!activeChat || !socket.current) return;

    if (selectedFile) {
      // Handle file sending logic here
      // For now, let's just log it
      console.log("Sending file:", selectedFile.name);
      // Example of sending image URL
      socket.current.emit("sendImage", {
        imageUrl: `https://example.com/images/${selectedFile.name}`,
        conversationId: activeChat._id,
        senderId: currentUser?._id,
      });
    } else {
      socket.current.emit("send-message", {
        conversationId: activeChat._id,
        content: message,
        senderId: currentUser?._id,
      });
    }

    if (userStatus?.status && userStatus.userId === otherUser?._id) {
      socket.current?.emit("message-seen", {
        conversationId: activeChat?._id,
      });
    }
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
    if (file) setSelectedFile(file);
  };

  const getOtherUserId = (): string | null => {
    if (!activeChat || activeChat.type === "group") return null;
    return (
      activeChat.participants.find((p: any) => p._id !== otherUser?._id) || null
    );
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
    <div className="flex-1 flex flex-col bg-chat-bg">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card flex items-center px-4 justify-between shadow-sm">
        <button
          onClick={() => {
            const otherUserId = getOtherUserId();
            if (otherUserId) onShowProfile(otherUserId);
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
              {userStatus?.status && userStatus.userId === otherUser?._id
                ? "Online"
                : "Offline"}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  const otherUserId = getOtherUserId();
                  if (otherUserId) onShowProfile(otherUserId);
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
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        {selectedFile && (
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Paperclip className="w-4 h-4" />
            <span>{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Remove
            </Button>
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
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />

          <Button
            onClick={handleSend}
            size="icon"
            disabled={!message.trim() && !selectedFile}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
