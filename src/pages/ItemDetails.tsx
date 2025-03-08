
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Share2,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FoundItem {
  id: string;
  user_id: string;
  item_name: string;
  category: string;
  location: string;
  description: string;
  contact_preference: string;
  images: string[];
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};

const ItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  
  const [item, setItem] = useState<FoundItem | null>(null);
  const [finderProfile, setFinderProfile] = useState<UserProfile | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      setIsLoading(true);
      try {
        if (!id) {
          throw new Error("Item ID is missing");
        }
        
        // Fetch item details
        const { data: itemData, error: itemError } = await supabase
          .from('found_items')
          .select('*')
          .eq('id', id)
          .single();
          
        if (itemError) {
          throw itemError;
        }
        
        if (!itemData) {
          throw new Error("Item not found");
        }
        
        setItem(itemData);
        
        // Fetch finder's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', itemData.user_id)
          .single();
          
        if (profileError) {
          console.error("Error fetching finder profile:", profileError);
        } else {
          setFinderProfile(profileData);
        }
        
      } catch (err: any) {
        console.error("Error fetching item details:", err);
        setError(err.message || "Failed to load item details");
        toast.error("Error loading item details", {
          description: err.message || "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItemDetails();
  }, [id]);

  const handleNextImage = () => {
    if (item && activeImageIndex < item.images.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
    }
  };
  
  const handlePrevImage = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Found Item: ${item?.item_name}`,
        text: `Check out this found item on Find & Bask: ${item?.item_name}`,
        url: window.location.href,
      }).catch(err => {
        console.error("Error sharing:", err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to contact the finder", {
        description: "You need to be logged in to send messages",
      });
      return;
    }
    
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    
    setIsSending(true);
    try {
      // In a real app, you would implement a messaging system
      // For now, just show a success toast
      toast.success("Message sent successfully", {
        description: "The finder will be notified of your message",
      });
      setMessage("");
    } catch (err: any) {
      toast.error("Failed to send message", {
        description: err.message || "Please try again later",
      });
    } finally {
      setIsSending(false);
    }
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

  if (error || !item) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center py-24 px-4 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Item Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "The item you're looking for doesn't exist or has been removed"}
          </p>
          <Link to="/search-lost-items">
            <Button>Back to Search</Button>
          </Link>
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
          <div className="mb-8">
            <Link 
              to="/search-lost-items" 
              className="flex items-center text-sm text-primary hover:underline"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Search Results
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Image Gallery */}
            <div className="relative rounded-xl overflow-hidden border border-border bg-card">
              {item.images.length > 0 ? (
                <>
                  <div className="aspect-square">
                    <img 
                      src={item.images[activeImageIndex]} 
                      alt={item.item_name} 
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  
                  {item.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={handlePrevImage}
                        disabled={activeImageIndex === 0}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={handleNextImage}
                        disabled={activeImageIndex === item.images.length - 1}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                      
                      <div className="flex justify-center mt-4 gap-2 p-4">
                        {item.images.map((image, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`w-16 h-16 rounded-md overflow-hidden border ${
                              index === activeImageIndex ? 'border-primary' : 'border-border'
                            }`}
                            onClick={() => setActiveImageIndex(index)}
                          >
                            <img 
                              src={image} 
                              alt={`Thumbnail ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-accent">
                  <p className="text-muted-foreground">No images available</p>
                </div>
              )}
            </div>
            
            {/* Item Details */}
            <div>
              <div className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold">{item.item_name}</h1>
                  <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground mb-6">
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full mr-3">
                    {item.category}
                  </span>
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="mr-3">{item.location}</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatTimeAgo(item.created_at)}</span>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-lg font-medium mb-2">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
                
                <div className="border-t border-border pt-6 mb-8">
                  <h2 className="text-lg font-medium mb-4">Found By</h2>
                  <div className="flex items-center">
                    <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center text-primary font-medium">
                      {finderProfile?.full_name?.slice(0, 2) || 'U'}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{finderProfile?.full_name || "Anonymous User"}</p>
                      <p className="text-xs text-muted-foreground">
                        Prefers to be contacted via: {item.contact_preference === 'app' ? 'In-app messages' : 
                          item.contact_preference === 'email' ? 'Email' : 'Phone'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contact Finder
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Contact About Found Item</DialogTitle>
                        <DialogDescription>
                          Send a message to the finder of this item. Provide details that can help verify your ownership.
                        </DialogDescription>
                      </DialogHeader>
                      
                      {isAuthenticated ? (
                        <>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Your Message</h4>
                              <Textarea
                                placeholder="Describe the item in detail to prove ownership (specific marks, contents, etc.)"
                                className="min-h-[120px]"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                              />
                            </div>
                            
                            {item.contact_preference !== 'app' && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Your Contact Information</h4>
                                <div className="flex items-center">
                                  {item.contact_preference === 'email' ? (
                                    <>
                                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <Input placeholder="Your email address" />
                                    </>
                                  ) : (
                                    <>
                                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <Input placeholder="Your phone number" />
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button type="submit" onClick={handleSendMessage} disabled={isSending}>
                              {isSending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                "Send Message"
                              )}
                            </Button>
                          </DialogFooter>
                        </>
                      ) : (
                        <div className="py-4 text-center space-y-4">
                          <p>You need to be signed in to contact the finder.</p>
                          <Link to="/login">
                            <Button>Sign In</Button>
                          </Link>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Please only contact if you believe this is your lost item. Provide specific details 
                    that can help verify your ownership.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default ItemDetails;
