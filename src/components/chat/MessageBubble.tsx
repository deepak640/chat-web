import { Message, User } from "@/types/chat";
import { format } from "date-fns";
import { Check, CheckCheck, Download, FileIcon } from "lucide-react";
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
            <div className="mt-2">
              {message.type === "image" ? (
                <div
                  className="rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => window.open(message.fileUrl, "_blank")}
                >
                  <img
                    src={message.fileUrl}
                    alt={message.fileName || "Image"}
                    className="max-w-full sm:max-w-[300px] max-h-[300px] object-cover"
                  />
                </div>
              ) : message.type === "video" ? (
                <div className="rounded-lg overflow-hidden max-w-full sm:max-w-[300px]">
                  <video
                    src={message.fileUrl}
                    controls
                    className="w-full max-h-[300px]"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-background/20 rounded-lg max-w-[250px]">
                  <div className="h-10 w-10 rounded-lg bg-background/20 flex items-center justify-center shrink-0">
                    <FileIcon className="w-5 h-5 opacity-70" />
                  </div>
                  <div className="flex-1 overflow-hidden min-w-0">
                    <p className="text-sm font-medium truncate">
                      {message.fileName || "Attachment"}
                    </p>
                    {message.fileSize && (
                      <p className="text-xs opacity-70">{message.fileSize}</p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 hover:bg-background/20"
                    onClick={async () => {
                      try {
                        const response = await fetch(message.fileUrl!);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = message.fileName || "download";
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (error) {
                        console.error("Download failed:", error);
                        window.open(message.fileUrl, "_blank");
                      }
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
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
