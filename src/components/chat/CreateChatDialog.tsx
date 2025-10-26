import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useCreateChat } from '@/services/chat.service';

interface CreateChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateChatDialog = ({ open, onOpenChange }: CreateChatDialogProps) => {
  // const { users } = useSelector((state: RootState) => state.chat);
  const users = [
    { id: 'u1', name: 'Alice', avatar: 'https://i.pravatar.cc/40?img=1', email: 'alice@example.com' },
    { id: 'u2', name: 'Bob', avatar: 'https://i.pravatar.cc/40?img=2', email: 'bob@example.com' },
    { id: 'u3', name: 'Charlie', avatar: 'https://i.pravatar.cc/40?img=3', email: 'charlie@example.com' },
  ];
  const createChatMutation = useCreateChat();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  const handleCreateDirect = () => {
    if (selectedUsers.length === 1) {
      createChatMutation.mutate({ participants: selectedUsers }, {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedUsers([]);
        }
      });
    }
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length >= 2 && groupName.trim()) {
      createChatMutation.mutate({ participants: selectedUsers, isGroup: true, name: groupName }, {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedUsers([]);
          setGroupName('');
        }
      });
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
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
                {users.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer"
                    onClick={() => setSelectedUsers([user.id])}
                  >
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleUser(user.id)}
                    />
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button
              onClick={handleCreateDirect}
              disabled={selectedUsers.length !== 1 || createChatMutation.isPending}
              className="w-full"
            >
              {createChatMutation.isPending ? 'Starting chat...' : 'Start Chat'}
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
                  {users.map((user: any) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
                      onClick={() => toggleUser(user.id)}
                    >
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                      <img
                        src={user.avatar}
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
              disabled={selectedUsers.length < 2 || !groupName.trim() || createChatMutation.isPending}
              className="w-full"
            >
              {createChatMutation.isPending ? 'Creating group...' : `Create Group (${selectedUsers.length} members)`}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatDialog;
