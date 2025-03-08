
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Search, User, LogOut, CheckCircle, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyApp, setNotifyApp] = useState(true);

  // Fetch user profile data
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setPhone(profile.phone || "");
      
      // Handle notification preferences
      if (profile.notification_preferences) {
        const prefs = profile.notification_preferences;
        if (typeof prefs === 'object' && prefs !== null) {
          setNotifyEmail(prefs.email === true);
          setNotifySms(prefs.sms === true);
          setNotifyApp(prefs.app === true);
        }
      }
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          bio,
          location,
          phone,
          notification_preferences: {
            email: notifyEmail,
            sms: notifySms,
            app: notifyApp
          }
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error logging out",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="md:col-span-1">
              <CardHeader className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile?.avatar_url || ""} alt={fullName} />
                  <AvatarFallback className="text-xl">
                    {fullName.split(" ").map(n => n[0]).join("") || <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                
                <CardTitle>{profile?.full_name || "User"}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
                
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  {profile?.location && (
                    <>
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      <span>{profile.location}</span>
                    </>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {profile?.bio && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">About</h3>
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Notifications</h3>
                  <div className="text-sm text-muted-foreground">
                    {notifyEmail && <div className="flex items-center mb-1"><CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" /> Email notifications</div>}
                    {notifySms && <div className="flex items-center mb-1"><CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" /> SMS notifications</div>}
                    {notifyApp && <div className="flex items-center mb-1"><CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" /> In-app notifications</div>}
                  </div>
                </div>
                
                <Button 
                  variant={isEditing ? "ghost" : "default"} 
                  className="w-full"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel Editing" : "Edit Profile"}
                </Button>
              </CardContent>
            </Card>
            
            {/* Profile Edit Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{isEditing ? "Edit Profile" : "Account Information"}</CardTitle>
                <CardDescription>
                  {isEditing 
                    ? "Update your profile information and notification preferences." 
                    : "Your personal information and notification settings."}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          value={fullName} 
                          onChange={(e) => setFullName(e.target.value)} 
                          placeholder="Your full name" 
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          value={bio} 
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us a little about yourself"
                          className="resize-none"
                          rows={4}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          value={location} 
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Your city/location"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Notification Preferences</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notif">Email Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch 
                          id="email-notif" 
                          checked={notifyEmail} 
                          onCheckedChange={setNotifyEmail} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sms-notif">SMS Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive notifications via SMS
                          </p>
                        </div>
                        <Switch 
                          id="sms-notif" 
                          checked={notifySms} 
                          onCheckedChange={setNotifySms} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="app-notif">In-app Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive notifications within the app
                          </p>
                        </div>
                        <Switch 
                          id="app-notif" 
                          checked={notifyApp} 
                          onCheckedChange={setNotifyApp} 
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                      className="w-full"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div>
                        <Label>Full Name</Label>
                        <p className="text-sm">{profile?.full_name || "Not set"}</p>
                      </div>
                      
                      <div>
                        <Label>Email</Label>
                        <p className="text-sm">{user?.email}</p>
                      </div>
                      
                      <div>
                        <Label>Location</Label>
                        <p className="text-sm">{profile?.location || "Not set"}</p>
                      </div>
                      
                      <div>
                        <Label>Phone</Label>
                        <p className="text-sm">{profile?.phone || "Not set"}</p>
                      </div>
                      
                      {profile?.bio && (
                        <div>
                          <Label>Bio</Label>
                          <p className="text-sm whitespace-pre-line">{profile.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
