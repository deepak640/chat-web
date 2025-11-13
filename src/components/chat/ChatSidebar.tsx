import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquarePlus, Search, User, Users } from "lucide-react";
import { format } from "date-fns";
import CreateChatDialog from "./CreateChatDialog";
import { cn } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { useGetChats, useGetUsers } from "@/services/chat.service";
import {
  setChats,
  setUsers,
  setActiveChat,
  setMessages,
} from "@/store/slices/chatSlice";
import { useGetUserList } from "@/services/user.service";
import { useSocket } from "@/hooks/useScoket";

interface ChatSidebarProps {
  onShowProfile: (userId: string) => void;
}

const ChatSidebar = ({ onShowProfile }: ChatSidebarProps) => {
  const dispatch = useDispatch();
  const { activeChat } = useSelector((state: RootState) => state.chat);
  const { lastMessage } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: users } = useGetUserList({ userId: user._id });
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateChat, setShowCreateChat] = useState(false);

  const { data: chats } = useGetChats();
  const { data: usersData } = useGetUsers();

  const handleClickChat = (chat: any) => {
    dispatch(setActiveChat(chat));
    dispatch(setMessages([]));
  };

  useEffect(() => {
    if (usersData) {
      dispatch(setUsers(usersData.data));
    }
  }, [usersData, dispatch]);

  const filteredChats = chats
    ? chats?.filter((chat: any) => {
        const chatName =
          chat.userName ||
          users.find((u: any) => chat?.participants?.includes(u._id))?.name ||
          "";
        return chatName.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];
  console.log("🚀 -----------------------------------------------🚀")
  console.log("🚀 ~ ChatSidebar ~ filteredChats:", filteredChats)
  console.log("🚀 -----------------------------------------------🚀")

  const filteredUsers = users?.filter((user: any) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChatName = (chat: any) => {
    if (chat.type === "group") return chat.userName;
    const otherUser = users.find(
      (u: any) =>
        chat.participants?.includes(u._id) && u._id !== currentUser?._id
    );
    return otherUser?.name || "Unknown";
  };

  const getChatAvatar = (chat: any) => {
    if (chat.type === "group") return chat.photo;
    const otherUser = users.find(
      (u: any) =>
        chat.participants?.includes(u._id) && u._id !== currentUser?._id
    );
    return otherUser?.photo;
  };

  const getLastMessagePreview = (chat: any) => {
    const lastMsg = lastMessage ?? chat.lastMessage;
    if (!lastMsg) return "No messages yet";
    if (lastMsg.fileName) return `📎 ${lastMsg.fileName}`;
    return lastMsg.content;
  };

  return (
    <>
      <aside className="w-full sm:w-80 lg:w-96 border-r border-border bg-card flex flex-col">
        <div className="p-4 space-y-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCreateChat(true)}
            >
              <MessageSquarePlus className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="chats" className="flex-1 flex flex-col">
          <TabsList className="grid  grid-cols-2 mx-4 my-2">
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                {filteredChats.map((chat: any) => (
                  <button
                    key={chat._id}
                    onClick={() => handleClickChat(chat)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left hover:bg-secondary/50 transition-colors",
                      activeChat?._id === chat._id && "bg-secondary"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        {getChatAvatar(chat) ? (
                          <img
                            src={getChatAvatar(chat)}
                            alt={getChatName(chat)}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                            {currentUser?.email ? (
                              currentUser.email.charAt(0).toUpperCase()
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                        )}
                        {chat.type === "direct" && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-status-online border-2 border-card rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate">
                            {getChatName(chat)}
                          </h3>
                          {chat.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(
                                  lastMessage?.timestamp ??
                                    chat.lastMessage.timestamp
                                ),
                                "HH:mm"
                              )}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {getLastMessagePreview(chat)}
                          </p>
                          {chat.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="users" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                {filteredUsers?.map((user: any) => (
                  <button
                    key={user._id}
                    onClick={() => onShowProfile(user._id)}
                    className="w-full p-3 rounded-lg text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div
                          className={cn(
                            "absolute bottom-0 right-0 w-3 h-3 border-2 border-card rounded-full",
                            user.status === "online" && "bg-status-online",
                            user.status === "away" && "bg-status-away",
                            user.status === "offline" && "bg-status-offline"
                          )}
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {user.status}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </aside>

      <CreateChatDialog
        open={showCreateChat}
        onOpenChange={setShowCreateChat}
      />
    </>
  );
};

export default ChatSidebar;
