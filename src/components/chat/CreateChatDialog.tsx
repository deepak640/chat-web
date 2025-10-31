import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useCreateChat } from "@/services/chat.service";
import { useGetUserList } from "@/services/user.service";
import { setActiveChat } from "@/store/slices/chatSlice";

interface CreateChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateChatDialog = ({ open, onOpenChange }: CreateChatDialogProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: users } = useGetUserList({ userId: user._id });
  const { mutate: createChat, isPending } = useCreateChat();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const dispatch = useDispatch();

  const handleCreateDirect = () => {
    if (selectedUsers.length === 1) {
      createChat(
        { participants: selectedUsers },
        {
          onSuccess: ({ data }) => {
            dispatch(setActiveChat(data));
            onOpenChange(false);
            setSelectedUsers([]);
          },
        }
      );
    }
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length >= 2 && groupName.trim()) {
      createChat(
        { participants: selectedUsers, isGroup: true, name: groupName },
        {
          onSuccess: () => {
            onOpenChange(false);
            setSelectedUsers([]);
            setGroupName("");
          },
        }
      );
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
          <DialogDescription>
            Start a new conversation or create a group
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="direct">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Message</TabsTrigger>
            <TabsTrigger value="group">Group Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {users &&
                  users.map((user: any) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer"
                      onClick={() => setSelectedUsers([user._id])}
                    >
                      <Checkbox
                        checked={selectedUsers.includes(user._id)}
                        onCheckedChange={() => toggleUser(user._id)}
                      />
                      <img
                        src={user.photo}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
            <Button
              onClick={handleCreateDirect}
              disabled={selectedUsers.length !== 1 || isPending}
              className="w-full"
            >
              {isPending ? "Starting chat..." : "Start Chat"}
            </Button>
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Select Members (minimum 2)</Label>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {users &&
                    users.map((user: any) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
                        onClick={() => toggleUser(user._id)}
                      >
                        <Checkbox
                          checked={selectedUsers.includes(user._id)}
                          onCheckedChange={() => toggleUser(user._id)}
                        />
                        <img
                          src={user.photo}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm">{user.name}</span>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>

            <Button
              onClick={handleCreateGroup}
              disabled={
                selectedUsers.length < 2 || !groupName.trim() || isPending
              }
              className="w-full"
            >
              {isPending
                ? "Creating group..."
                : `Create Group (${selectedUsers.length} members)`}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatDialog;
