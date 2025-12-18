# 💬 Chat Application - Frontend

A modern, responsive real-time chat application frontend built with React, TypeScript, and Tailwind CSS. Features a beautiful UI with instant messaging, typing indicators, and user presence detection.

## ✨ Features

- **Real-time Messaging**: Instant message delivery via WebSockets
- **Beautiful UI**: Modern design with shadcn/ui components and Tailwind CSS
- **User Authentication**: Secure login and registration system
- **Conversation Management**: View and manage multiple chat conversations
- **Typing Indicators**: See when others are typing
- **User Presence**: Real-time online/offline status
- **Profile Management**: Update profile information and avatar
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Type Safety**: Built entirely with TypeScript

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: 
  - Redux Toolkit (Global state)
  - React Context (Chat state)
- **Real-time**: WebSocket (Socket.io client)
- **HTTP Client**: Axios
- **Routing**: React Router

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── pages/               # Application pages
│   │   ├── Auth.tsx         # Login/Register page
│   │   ├── Chat.tsx         # Main chat interface
│   │   └── Profile.tsx      # User profile page
│   ├── services/            # API services
│   │   ├── user.service.ts
│   │   └── chat.service.ts
│   ├── store/               # Redux store
│   │   └── slices/
│   ├── context/             # React Context
│   │   └── ChatContext.tsx
│   ├── hooks/               # Custom hooks
│   │   └── useSocket.ts     # WebSocket hook
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main App component
│   └── main.tsx             # Entry point
├── public/
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm or bun package manager
- Backend server running

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🎯 Core Features

### Authentication
- User registration with email validation
- Secure login with JWT tokens
- Persistent authentication state
- Protected routes

### Chat Interface
- Real-time message delivery
- Message history loading
- Conversation list view
- Typing indicators
- User online/offline status
- Message timestamps

### User Profile
- View and edit profile information
- Upload profile pictures
- Update user details

## 🔌 API Integration

### Services

#### User Service (`user.service.ts`)
```typescript
- register(userData)      // Register new user
- login(credentials)      // Login user
- getProfile()           // Get current user profile
- updateProfile(data)    // Update user profile
```

#### Chat Service (`chat.service.ts`)
```typescript
- getConversations()                    // Get all conversations
- createConversation(userId)            // Create new conversation
- getMessages(conversationId)           // Get conversation messages
- sendMessage(conversationId, content)  // Send a message
```

## 🔄 WebSocket Integration

The `useSocket` hook manages real-time communication:

```typescript
const socket = useSocket();

// Join a conversation
socket.emit('join_chat', { conversationId });

// Send a message
socket.emit('send_message', { conversationId, message });

// Listen for messages
socket.on('receive_message', (message) => {
  // Handle incoming message
});

// Typing indicators
socket.emit('typing', { conversationId });
socket.on('typing_broadcast', (data) => {
  // Show typing indicator
});
```

## 🎨 UI Components

Built with **shadcn/ui** and styled with **Tailwind CSS**:

- **Button**: Customizable button component
- **Card**: Container component for content
- **Input**: Form input fields
- **Avatar**: User profile pictures
- **Dialog**: Modal dialogs
- **Toast**: Notification system
- **ScrollArea**: Scrollable content areas

## 📱 Pages

### Auth Page
- Clean, modern login/register interface
- Form validation
- Error handling
- Smooth transitions

### Chat Page
- Sidebar with conversation list
- Main chat window with messages
- Message input with send button
- Real-time updates
- Typing indicators

### Profile Page
- User information display
- Editable profile fields
- Avatar upload
- Save changes functionality

## 🔐 State Management

### Redux Toolkit (Global State)
- User authentication state
- User profile data
- App-wide settings

### React Context (Chat State)
- Active conversation
- Messages
- Typing indicators
- Online users

## 🚦 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## 🎨 Customization

### Tailwind Configuration
Customize colors, fonts, and more in `tailwind.config.js`

### shadcn/ui Components
Add new components:
```bash
npx shadcn-ui@latest add [component-name]
```

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api/v1` |
| `VITE_SOCKET_URL` | WebSocket server URL | `http://localhost:5000` |

## 📦 Building for Production

```bash
npm run build
```

The optimized production files will be in the `dist/` directory.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name - [Your GitHub Profile]

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for blazing fast builds

---

Built with ❤️ using React and TypeScript
