import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { useSocket } from "./hooks/useSocket";
import RedirectIfAuthenticated from "./components/common/RedirectIfAuthenticated";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import CallManager from "./components/chat/CallManager";

const App = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  useSocket({ userId: currentUser?._id, dispatch });
  return (
    <TooltipProvider>
      <CallManager />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/auth" element={<Auth />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
