import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useCreateChat } from "@/services/chat.service";
import { RootState } from "@/store/store";
import { Calendar, Clock, Mail, MessageSquare, Phone, X } from "lucide-react";
import { useSelector } from "react-redux";
import { format } from "date-fns";

interface ProfilePanelProps {
  userId: string;
  show: boolean;
  onClose: () => void;
}

const ProfilePanelHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="h-16 border-b border-border flex items-center justify-between px-4">
    <h3 className="font-semibold">Profile Info</h3>
    <Button variant="ghost" size="icon" onClick={onClose}>
      <X className="w-5 h-5" />
    </Button>
  </div>
);

const ProfilePanelContent = ({
  userId,
  isSheet,
  onClose,
}: {
  userId: string;
  isSheet: boolean;
  onClose: () => void;
}) => {
  const { users } = useSelector((state: RootState) => state.chat);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { mutate: createChat, isPending } = useCreateChat();

  const user =
    userId === currentUser?._id
      ? currentUser
      : users.find((u: any) => u._id === userId);

  if (!user) return null;

  const isOwnProfile = user._id === currentUser?.id;

  const handleStartChat = () => {
    if (!isOwnProfile) {
      createChat(
        {
          participants: [user._id, currentUser?._id],
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  const getLastSeenText = () => {
    if (user.status === "online") return "Online now";
    if (!user.lastSeen) return "Unknown";
    const diff = Date.now() - new Date(user.lastSeen).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {isSheet ? (
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle>Profile Info</SheetTitle>
        </SheetHeader>
      ) : (
        <ProfilePanelHeader onClose={onClose} />
      )}

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-32 h-32 rounded-full"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary/60 flex items-center justify-center">
                  <span className="text-4xl font-semibold text-primary">
                    {user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  "absolute bottom-2 right-2 w-6 h-6 border-4 border-card rounded-full",
                  user.status === "online" && "bg-status-online",
                  user.status === "away" && "bg-status-away",
                  user.status === "offline" && "bg-status-offline"
                )}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground capitalize">
                {user.status}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex gap-2">
              <Button
                onClick={handleStartChat}
                className="flex-1"
                disabled={isPending}
              >
                {isPending ? (
                  "Starting chat..."
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </>
                )}
              </Button>
            </div>
          )}

          <Separator />

          {/* Bio */}
          {user.bio && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                About
              </h3>
              <p className="text-sm">{user.bio}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Contact Information
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.dob && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Date of Birth
                    </p>
                    <p className="font-medium">
                      {format(new Date(user.dob), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Last Seen</p>
                  <p className="font-medium">{getLastSeenText()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

const ProfilePanel = ({ userId, show, onClose }: ProfilePanelProps) => {
  const isMobile = useMobile();

  if (isMobile) {
    return (
      <Sheet open={show} onOpenChange={onClose}>
        <SheetContent className="p-0 w-full sm:w-80 lg:w-96 flex flex-col">
          <ProfilePanelContent
            userId={userId}
            isSheet={true}
            onClose={onClose}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    show && (
      <div className="w-80 lg:w-96 border-l border-border bg-card flex flex-col">
        <ProfilePanelContent
          userId={userId}
          isSheet={false}
          onClose={onClose}
        />
      </div>
    )
  );
};

export default ProfilePanel;
