import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useUpdateProfile } from '@/services/profile.service';

const Profile = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    bio: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        dob: currentUser.dob || '',
        bio: currentUser.bio || '',
      });
    }
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been saved successfully.',
        });
        navigate('/');
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update profile.',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-32 h-32 rounded-full"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
