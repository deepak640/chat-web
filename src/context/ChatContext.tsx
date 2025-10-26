import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Chat, Message, Notification } from '@/types/chat';

interface ChatContextType {
  currentUser: User | null;
  users: User[];
  chats: Chat[];
  notifications: Notification[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, content: string, file?: File) => void;
  createChat: (participantIds: string[], isGroup?: boolean, groupName?: string) => void;
  deleteChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within ChatProvider');
  return context;
};

// Dummy data generator
const generateDummyUsers = (): User[] => [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    status: 'online',
    lastSeen: new Date(),
    phone: '+1234567890',
    dob: '1995-03-15',
    bio: 'Software engineer who loves coding and coffee ☕',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    status: 'away',
    lastSeen: new Date(Date.now() - 300000),
    phone: '+1234567891',
    dob: '1992-07-22',
    bio: 'Designer & creative thinker',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  },
  {
    id: '3',
    name: 'Carol White',
    email: 'carol@example.com',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000),
    phone: '+1234567892',
    dob: '1998-11-08',
    bio: 'Marketing specialist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
  },
  {
    id: '4',
    name: 'David Lee',
    email: 'david@example.com',
    status: 'online',
    lastSeen: new Date(),
    phone: '+1234567893',
    dob: '1990-05-30',
    bio: 'Product manager & startup enthusiast',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
  },
];

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(generateDummyUsers());
  const [chats, setChats] = useState<Chat[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  // Initialize with some dummy chats
  useEffect(() => {
    if (currentUser && chats.length === 0) {
      const dummyChats: Chat[] = [
        {
          id: 'chat-1',
          type: 'direct',
          participants: [currentUser.id, '1'],
          messages: [
            {
              id: 'msg-1',
              content: 'Hey! How are you?',
              senderId: '1',
              timestamp: new Date(Date.now() - 3600000),
              read: true,
            },
            {
              id: 'msg-2',
              content: "I'm doing great! Thanks for asking 😊",
              senderId: currentUser.id,
              timestamp: new Date(Date.now() - 3000000),
              read: true,
            },
          ],
          unreadCount: 0,
        },
        {
          id: 'chat-2',
          type: 'group',
          name: 'Team Chat',
          participants: [currentUser.id, '1', '2', '4'],
          messages: [
            {
              id: 'msg-3',
              content: 'Meeting at 3 PM today!',
              senderId: '4',
              timestamp: new Date(Date.now() - 1800000),
              read: false,
            },
          ],
          unreadCount: 1,
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Team',
        },
      ];
      setChats(dummyChats);
    }
  }, [currentUser]);

  const login = async (email: string, password: string) => {
    // Dummy login - in real app, this would call your backend
    const user: User = {
      id: 'current-user',
      name: 'You',
      email,
      status: 'online',
      lastSeen: new Date(),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    };
    setCurrentUser(user);
  };

  const register = async (email: string, password: string, name: string) => {
    // Dummy registration
    const user: User = {
      id: 'current-user',
      name,
      email,
      status: 'online',
      lastSeen: new Date(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
    setChats([]);
    setActiveChat(null);
  };

  const sendMessage = (chatId: string, content: string, file?: File) => {
    if (!currentUser) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      senderId: currentUser.id,
      timestamp: new Date(),
      read: false,
      ...(file && {
        fileName: file.name,
        fileType: file.type,
        fileUrl: URL.createObjectURL(file),
      }),
    };

    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage,
            }
          : chat
      )
    );
  };

  const createChat = (participantIds: string[], isGroup = false, groupName?: string) => {
    if (!currentUser) return;

    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      type: isGroup ? 'group' : 'direct',
      name: groupName,
      participants: [currentUser.id, ...participantIds],
      messages: [],
      unreadCount: 0,
      ...(isGroup && { avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${groupName}` }),
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat?.id === chatId) setActiveChat(null);
  };

  const leaveChat = (chatId: string) => {
    if (!currentUser) return;
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              participants: chat.participants.filter(id => id !== currentUser.id),
            }
          : chat
      )
    );
    if (activeChat?.id === chatId) setActiveChat(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, ...updates });
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === notificationId ? { ...notif, read: true } : notif))
    );
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        users,
        chats,
        notifications,
        activeChat,
        setActiveChat,
        sendMessage,
        createChat,
        deleteChat,
        leaveChat,
        updateProfile,
        markNotificationAsRead,
        login,
        register,
        logout,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
