import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatContext } from '@/context/ChatContext';
import {
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Trash2,
  LogOut,
  Info,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MessageBubble from './MessageBubble';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  onShowProfile: (userId: string) => void;
}

const ChatWindow = ({ onShowProfile }: ChatWindowProps) => {
  const { activeChat, currentUser, users, sendMessage, deleteChat, leaveChat } = useChatContext();
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-bg">
        <div className="text-center space-y-4 px-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Send className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Welcome to ChatApp</h2>
          <p className="text-muted-foreground max-w-md">
            Select a chat from the sidebar to start messaging, or find users to connect with.
          </p>
        </div>
      </div>
    );
  }

  const getChatName = () => {
    if (activeChat.type === 'group') return activeChat.name;
    const otherUser = users.find(u => activeChat.participants.includes(u.id) && u.id !== currentUser?.id);
    return otherUser?.name || 'Unknown';
  };

  const getChatAvatar = () => {
    if (activeChat.type === 'group') return activeChat.avatar;
    const otherUser = users.find(u => activeChat.participants.includes(u.id) && u.id !== currentUser?.id);
    return otherUser?.avatar;
  };

  const getOtherUserId = () => {
    return users.find(u => activeChat.participants.includes(u.id) && u.id !== currentUser?.id)?.id;
  };

  const handleSend = () => {
    if ((!message.trim() && !selectedFile) || !currentUser) return;

    sendMessage(activeChat.id, message, selectedFile || undefined);
    setMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDeleteChat = () => {
    deleteChat(activeChat.id);
  };

  const handleLeaveChat = () => {
    leaveChat(activeChat.id);
  };

  return (
    <div className="flex-1 flex flex-col bg-chat-bg">
      {/* Chat Header */}
      <div className="h-16 border-b border-border bg-card flex items-center px-4 justify-between shadow-sm">
        <button
          onClick={() => {
            const userId = getOtherUserId();
            if (userId) onShowProfile(userId);
          }}
          className="flex items-center gap-3 hover:bg-secondary/50 rounded-lg p-2 -ml-2 transition-colors"
        >
          <img
            src={getChatAvatar()}
            alt={getChatName()}
            className="w-10 h-10 rounded-full"
          />
          <div className="text-left">
            <h3 className="font-semibold">{getChatName()}</h3>
            <p className="text-sm text-muted-foreground">
              {activeChat.type === 'group'
                ? `${activeChat.participants.length} members`
                : 'Online'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="w-5 h-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                const userId = getOtherUserId();
                if (userId) onShowProfile(userId);
              }}>
                <Info className="w-4 h-4 mr-2" />
                View Info
              </DropdownMenuItem>
              {activeChat.type === 'group' && (
                <DropdownMenuItem onClick={handleLeaveChat}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Group
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDeleteChat} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {activeChat.messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUser?.id}
              showAvatar={
                idx === 0 ||
                activeChat.messages[idx - 1].senderId !== msg.senderId
              }
              sender={users.find(u => u.id === msg.senderId)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
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
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Remove
            </Button>
          </div>
        )}
        
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
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
          
          <Button onClick={handleSend} size="icon">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
