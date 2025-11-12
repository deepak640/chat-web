import { Message, User } from "@/types/chat";
import { format } from "date-fns";
import { Check, CheckCheck, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  sender?: Partial<User>;
}

const MessageBubble = ({
  message,
  isOwn,
  showAvatar,
  sender,
}: MessageBubbleProps) => {
  console.log("🚀 ---------------------🚀");
  console.log("🚀 ~ message:", message);
  console.log("🚀 ---------------------🚀");
  return (
    <div className={cn("flex gap-2", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && showAvatar && (
        <>
          {sender?.avatar ? (
            <img
              src={sender.avatar}
              alt={sender?.name || sender?.email}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-medium">
              {sender?.email
                ? sender.email.charAt(0).toUpperCase()
                : sender?.name
                ? sender.name.charAt(0).toUpperCase()
                : "?"}
            </div>
          )}
        </>
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}

      <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
        {!isOwn && showAvatar && (
          <span className="text-sm font-medium mb-1 px-2">{sender?.name}</span>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2 max-w-md break-words",
            isOwn
              ? "bg-chat-sent text-chat-sent-text rounded-br-sm"
              : "bg-chat-received text-chat-received-text rounded-bl-sm"
          )}
        >
          {message.content && <p className="text-sm">{message.content}</p>}

          {message.fileUrl && (
            <div className="mt-2 flex items-center gap-2 p-2 bg-background/10 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">{message.fileName}</p>
                <p className="text-xs opacity-70">{message.fileType}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => window.open(message.fileUrl, "_blank")}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div
            className={cn(
              "flex items-center gap-1 mt-1",
              isOwn ? "justify-end" : "justify-start"
            )}
          >
            <span className="text-xs opacity-70">
              {format(message.timestamp, "HH:mm")}
            </span>
            {isOwn &&
              (message.read ? (
                <CheckCheck className="w-4 h-4 opacity-70" />
              ) : (
                <Check className="w-4 h-4 opacity-70" />
              ))}
          </div>
        </div>
      </div>

      {isOwn && showAvatar && (
        <>
          {sender?.avatar ? (
            <img
              src={sender.avatar}
              alt={sender?.name || sender?.email}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-medium">
              {sender?.email
                ? sender.email.charAt(0).toUpperCase()
                : sender?.name
                ? sender.name.charAt(0).toUpperCase()
                : "?"}
            </div>
          )}
        </>
      )}
      {isOwn && !showAvatar && <div className="w-8" />}
    </div>
  );
};

export default MessageBubble;
