
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Camera, LogOut, User as UserIcon, Bookmark } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const profileFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }).nullish(),
  location: z.string().min(3, {
    message: "Please enter a valid location.",
  }).nullish(),
  bio: z.string().max(500, {
    message: "Bio cannot exceed 500 characters.",
  }).nullish(),
});

interface FoundItem {
  id: string;
  item_name: string;
  category: string;
  location: string;
  description: string;
  images: string[];
  created_at: string;
}

interface SearchQuery {
  id: string;
  query_text: string;
  category: string | null;
  location: string | null;
  timeframe: string | null;
  created_at: string;
}

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [searchQueries, setSearchQueries] = useState<SearchQuery[]>([]);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      bio: "",
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        // Set form values
        form.reset({
          full_name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
          bio: profile.bio || "",
        });

        setAvatarUrl(profile.avatar_url);

        // Fetch user's found items
        const { data: items, error: itemsError } = await supabase
          .from('found_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (itemsError) {
          console.error("Error fetching found items:", itemsError);
        } else {
          setFoundItems(items || []);
        }

        // Fetch user's search queries
        const { data: queries, error: queriesError } = await supabase
          .from('lost_item_queries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (queriesError) {
          console.error("Error fetching search queries:", queriesError);
        } else {
          setSearchQueries(queries || []);
        }

      } catch (error: any) {
        toast.error("Error loading profile", {
          description: error.message,
        });
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, form]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Only accept images
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    try {
      setIsUploading(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(avatarUrl);
      toast.success("Avatar updated successfully");

    } catch (error: any) {
      toast.error("Error uploading avatar", {
        description: error.message,
      });
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          phone: values.phone,
          location: values.location,
          bio: values.bio,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Error updating profile", {
        description: error.message,
      });
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-16 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <h1 className="text-3xl font-bold mb-4 md:mb-0">Your Profile</h1>
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8 mb-8">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-accent flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="User avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </div>

                <div className="flex-1 w-full">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="your@email.com"
                                  disabled
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="+91 98765 43210"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Mumbai, India"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us a bit about yourself"
                                className="min-h-[100px]"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>

            <Tabs defaultValue="found_items">
              <TabsList className="mb-6">
                <TabsTrigger value="found_items">
                  <Camera className="mr-2 h-4 w-4" />
                  Items You Found
                </TabsTrigger>
                <TabsTrigger value="searches">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Your Searches
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="found_items">
                <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-6">Items You've Found</h2>
                  
                  {foundItems.length > 0 ? (
                    <div className="space-y-6">
                      {foundItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex flex-col md:flex-row gap-4 border-b border-border pb-6 last:border-0 last:pb-0"
                        >
                          <div className="h-24 w-24 md:h-32 md:w-32 rounded-md overflow-hidden bg-accent flex-shrink-0">
                            {item.images && item.images.length > 0 ? (
                              <img
                                src={item.images[0]}
                                alt={item.item_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                No Image
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                              <h3 className="font-bold text-lg">{item.item_name}</h3>
                              <span className="text-sm text-muted-foreground">
                                Posted on {formatDate(item.created_at)}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full mr-3">
                                {item.category}
                              </span>
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{item.location}</span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {item.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href={`/item-details/${item.id}`}>View Details</a>
                              </Button>
                              <Button variant="ghost" size="sm">
                                Mark as Claimed
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">
                        You haven't reported any found items yet.
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/post-found-item">Report a Found Item</a>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="searches">
                <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-6">Your Recent Searches</h2>
                  
                  {searchQueries.length > 0 ? (
                    <div className="space-y-4">
                      {searchQueries.map((query) => (
                        <div 
                          key={query.id} 
                          className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{query.query_text || "No search term"}</h3>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(query.created_at)}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 text-xs">
                            {query.category && (
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {query.category}
                              </span>
                            )}
                            
                            {query.location && (
                              <span className="bg-accent text-accent-foreground px-2 py-1 rounded-full flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {query.location}
                              </span>
                            )}
                            
                            {query.timeframe && (
                              <span className="bg-accent text-accent-foreground px-2 py-1 rounded-full">
                                {query.timeframe}
                              </span>
                            )}
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-3"
                            onClick={() => {
                              // Implement re-run search functionality
                              window.location.href = `/search-lost-items?query=${encodeURIComponent(query.query_text || "")}${query.category ? `&category=${encodeURIComponent(query.category)}` : ""}${query.location ? `&location=${encodeURIComponent(query.location)}` : ""}${query.timeframe ? `&timeframe=${encodeURIComponent(query.timeframe)}` : ""}`;
                            }}
                          >
                            <Search className="h-3 w-3 mr-1" />
                            Search Again
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">
                        You haven't made any searches yet.
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/search-lost-items">Search Lost Items</a>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
