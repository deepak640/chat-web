import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Search, Menu, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { useChatContext } from "@/context/ChatContext";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";

const ChatHeader = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  // const unreadCount = notifications.filter(n => !n.read).length;
  const unreadCount = 0;

  const notifications = [
    {
      id: "1",
      title: "New Message",
      content: "You have a new message from John.",
    },
    {
      id: "2",
      title: "Group Invite",
      content: 'You were added to the group "Project Team".',
    },
    { id: "3", title: "Mention", content: "Alice mentioned you in a chat." },
  ];

  const handleLogout = () => {
    dispatch(logout());
    console.log("User logged out");
    navigate("/auth");
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-4 gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold hidden sm:block">ChatApp</h1>
      </div>

      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className="flex flex-col items-start p-3"
                >
                  <div className="font-medium">{notif.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {notif.content}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="w-4 h-4 mr-2" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default ChatHeader;
