import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '@/context/ChatContext';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import ProfilePanel from '@/components/chat/ProfilePanel';
import { useState } from 'react';

const Chat = () => {
  const navigate = useNavigate();
  const { currentUser } = useChatContext();
  const [showProfile, setShowProfile] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleShowProfile = (userId: string) => {
    setProfileUserId(userId);
    setShowProfile(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader />
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar onShowProfile={handleShowProfile} />
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
