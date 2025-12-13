import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import ProfilePanel from "@/components/chat/ProfilePanel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";

const Chat = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [showProfile, setShowProfile] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth");
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleShowProfile = (userId: string) => {
    setProfileUserId(userId);
    setShowProfile(true);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSidebarOpen = () => {
    setSidebarOpen(true);
  };

  const handleChatSelect = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader onSidebarOpen={handleSidebarOpen} />
      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:flex">
          <ChatSidebar
            onShowProfile={handleShowProfile}
            onChatSelect={handleChatSelect}
          />
        </div>
        {isMobile && (
          <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-full sm:w-80 lg:w-96">
              <ChatSidebar
                onShowProfile={handleShowProfile}
                isSheet={true}
                onChatSelect={handleChatSelect}
              />
            </SheetContent>
          </Sheet>
        )}
        <ChatWindow onShowProfile={handleShowProfile} />
        {showProfile && (
          <ProfilePanel
            userId={profileUserId || currentUser.id}
            onClose={() => setShowProfile(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
