import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Trash2,
  LogOut,
  Info,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MessageBubble from "./MessageBubble";
import { Message } from "@/types/chat";
import { useSelector } from "react-redux";
import { useGetUserList } from "@/services/user.service";

// === Types ===
interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Chat {
  _id: string;
  type: "direct" | "group";
  name?: string;
  avatar?: string;
  participants: string[];
  messages: Message[];
}

interface RootState {
  chat: {
    activeChat: Chat | null;
  };
}

interface ChatWindowProps {
  onShowProfile: (userId: string) => void;
}

// === Component ===
const ChatWindow = ({ onShowProfile }: ChatWindowProps) => {
  // Mock users (replace with real data later)
  const [users] = useState<User[]>([
    { id: "u1", name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
    { id: "u2", name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
  ]);
  const { data: user } = useGetUserList({});
  const currentUser = users[0];

  // Get activeChat from Redux
  const reduxActiveChat = useSelector(
    (state: RootState) => state.chat.activeChat
  );
  const currentUserId = reduxActiveChat?.participants.find(
    ({ _id }: any) => _id !== user[0]._id
  );

  // Local state synced with Redux
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  // Sync Redux → Local state
  useEffect(() => {
    setActiveChat(reduxActiveChat);
  }, [reduxActiveChat]);

  // Input state
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on messages or chat change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeChat?.messages, activeChat]);

  // === Dummy Actions (replace with real API/dispatch) ===
  const sendMessage = (chatId: string, text: string, file?: File) => {
    if (!activeChat || activeChat._id !== chatId) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: currentUserId,
      content: text || undefined,
      fileName: file?.name,
      timestamp: new Date(),
      read: false,
    };

    setActiveChat((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev
    );
  };

  const deleteChat = (chatId: string) => {
    if (activeChat?._id === chatId) {
      setActiveChat(null);
    }
  };

  const leaveChat = (chatId: string) => {
    if (!activeChat || activeChat._id !== chatId || activeChat.type !== "group")
      return;

    setActiveChat((prev) =>
      prev
        ? {
            ...prev,
            participants: prev.participants.filter(
              ({ _id }: any) => _id !== currentUserId
            ),
          }
        : prev
    );
  };

  const getOtherUserId = (): string | null => {
    if (!activeChat || activeChat.type === "group") return null;
    return activeChat.participants.find((id) => id !== currentUser.id) || null;
  };

  // === Handlers ===
  const handleSend = () => {
    if (!message.trim() && !selectedFile) return;
    if (!activeChat) return;

    sendMessage(activeChat._id, message, selectedFile || undefined);
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

  const handleDeleteChat = () => {
    if (activeChat) deleteChat(activeChat._id);
  };

  const handleLeaveChat = () => {
    if (activeChat) leaveChat(activeChat._id);
  };

  // === Empty State ===
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

  // === Main Render ===
  return (
    <div className="flex-1 flex flex-col bg-chat-bg">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card flex items-center px-4 justify-between shadow-sm">
        <button
          onClick={() => {
            const userId = user[0]?._id;
            if (userId) onShowProfile(userId);
          }}
          className="flex items-center gap-3 hover:bg-secondary/50 rounded-lg p-2 -ml-2 transition-colors"
        >
          <img
            src={user[0]?.photo || "https://i.pravatar.cc/40?img=3"}
            alt={user[0]?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="text-left">
            <h3 className="font-semibold">{user[0]?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {activeChat.type === "group"
                ? `${activeChat.participants.length} members`
                : "Online"}
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
                  const userId = getOtherUserId();
                  if (userId) onShowProfile(userId);
                }}
              >
                <Info className="w-4 h-4 mr-2" />
                View Info
              </DropdownMenuItem>
              {activeChat.type === "group" && (
                <DropdownMenuItem onClick={handleLeaveChat}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Group
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDeleteChat}
                className="text-destructive"
              >
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
          {activeChat?.messages?.length &&
            activeChat?.messages?.map((msg, idx) => {
              const prevMsg = activeChat.messages[idx - 1];
              const showAvatar =
                idx === 0 || prevMsg?.senderId !== msg.senderId;

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderId === currentUser.id}
                  showAvatar={showAvatar}
                  // Optional: pass sender
                  // sender={users.find(u => u.id === msg.senderId)}
                />
              );
            })}
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
