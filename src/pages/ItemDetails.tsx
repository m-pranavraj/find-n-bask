
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  CheckCircle2,
  XCircle,
  Clock
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
import ClaimVerification from "@/components/ClaimVerification";
import ChatInterface from "@/components/ChatInterface";

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
  status: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface ItemClaim {
  id: string;
  item_id: string;
  claimer_id: string;
  owner_description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
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
  const navigate = useNavigate();
  
  const [item, setItem] = useState<FoundItem | null>(null);
  const [finderProfile, setFinderProfile] = useState<UserProfile | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claims, setClaims] = useState<ItemClaim[]>([]);
  const [userClaim, setUserClaim] = useState<ItemClaim | null>(null);
  const [isFinderUser, setIsFinderUser] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isHandoverDialogOpen, setIsHandoverDialogOpen] = useState(false);
  
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
        setIsFinderUser(user?.id === itemData.user_id);
        
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
        
        // If the user is the finder, fetch all claims for this item
        if (user?.id === itemData.user_id) {
          const { data: claimsData, error: claimsError } = await supabase
            .from('item_claims')
            .select('*')
            .eq('item_id', id)
            .order('created_at', { ascending: false });
            
          if (claimsError) {
            console.error("Error fetching claims:", claimsError);
          } else {
            // Type assertion for the status field
            const typedClaimsData = claimsData?.map(claim => ({
              ...claim,
              status: claim.status as 'pending' | 'approved' | 'rejected' | 'completed'
            })) || [];
            
            setClaims(typedClaimsData);
          }
        }
        
        // If the user is not the finder, check if they have a claim for this item
        if (user && user.id !== itemData.user_id) {
          const { data: userClaimData, error: userClaimError } = await supabase
            .from('item_claims')
            .select('*')
            .eq('item_id', id)
            .eq('claimer_id', user.id)
            .single();
            
          if (userClaimError && userClaimError.code !== 'PGRST116') { // PGRST116 is "no rows found"
            console.error("Error fetching user claim:", userClaimError);
          } else if (userClaimData) {
            // Type assertion for the status field
            setUserClaim({
              ...userClaimData,
              status: userClaimData.status as 'pending' | 'approved' | 'rejected' | 'completed'
            });
          }
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
  }, [id, user]);

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
  
  const handleReviewClaim = (claimId: string) => {
    setSelectedClaimId(claimId);
    setIsReviewDialogOpen(true);
  };
  
  const handleClaimAction = async (action: 'approve' | 'reject') => {
    if (!selectedClaimId) return;
    
    try {
      // Update the claim status
      const { error } = await supabase
        .from('item_claims')
        .update({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedClaimId);
        
      if (error) throw error;
      
      // If approved, update the item status
      if (action === 'approve') {
        const { error: itemError } = await supabase
          .from('found_items')
          .update({ status: 'claimed' })
          .eq('id', id);
          
        if (itemError) throw itemError;
      }
      
      // Refresh claims
      const { data: updatedClaims } = await supabase
        .from('item_claims')
        .select('*')
        .eq('item_id', id)
        .order('created_at', { ascending: false });
        
      // Type assertion for the status field
      const typedClaimsData = updatedClaims?.map(claim => ({
        ...claim,
        status: claim.status as 'pending' | 'approved' | 'rejected' | 'completed'
      })) || [];
      
      setClaims(typedClaimsData);
      
      toast.success(
        action === 'approve' 
          ? "Claim approved successfully" 
          : "Claim rejected successfully"
      );
      
      setIsReviewDialogOpen(false);
    } catch (error: any) {
      toast.error("Error updating claim", {
        description: error.message || "Please try again later"
      });
    }
  };
  
  const handleMarkCompleted = async () => {
    if (!id) return;
    
    try {
      // Update the found item status
      const { error: itemError } = await supabase
        .from('found_items')
        .update({ status: 'completed' })
        .eq('id', id);
        
      if (itemError) throw itemError;
      
      // Update any approved claims to completed
      const { error: claimsError } = await supabase
        .from('item_claims')
        .update({ status: 'completed' })
        .eq('item_id', id)
        .eq('status', 'approved');
        
      if (claimsError) throw claimsError;
      
      toast.success("Item marked as returned to owner", {
        description: "Thank you for helping someone find their lost item!"
      });
      
      // Refresh the page data
      setTimeout(() => {
        navigate(0); // Refresh the page
      }, 1500);
      
    } catch (error: any) {
      toast.error("Error updating item status", {
        description: error.message || "Please try again later"
      });
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
  
  const isItemActive = item.status === 'active';
  const isItemClaimed = item.status === 'claimed';
  const isItemCompleted = item.status === 'completed';

  // Find the approved claim for chat functionality
  const approvedClaim = claims.find(claim => claim.status === 'approved');

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
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{item.item_name}</h1>
                    <div className="flex items-center mt-2">
                      {item.status === 'active' && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      )}
                      {item.status === 'claimed' && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Claimed - Pending Handover
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Returned to Owner
                        </span>
                      )}
                    </div>
                  </div>
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
                
                {/* Chat Interface - Show when there's an approved claim */}
                {(userClaim?.status === 'approved' || (isFinderUser && approvedClaim)) && (
                  <div className="mb-8">
                    <h2 className="text-lg font-medium mb-4">Messages</h2>
                    <ChatInterface 
                      itemId={item.id} 
                      recipientId={isFinderUser ? approvedClaim?.claimer_id || '' : item.user_id}
                      claimId={isFinderUser ? approvedClaim?.id || '' : userClaim?.id || ''}
                    />
                  </div>
                )}
                
                {/* Item status actions */}
                {isFinderUser && isItemClaimed && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium flex items-center text-yellow-800">
                      <Clock className="h-4 w-4 mr-2" />
                      Item Claimed - Pending Handover
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1 mb-3">
                      After you've returned the item to its owner, mark the process as complete.
                    </p>
                    <Button 
                      onClick={() => setIsHandoverDialogOpen(true)} 
                      variant="outline" 
                      className="w-full border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Returned to Owner
                    </Button>
                  </div>
                )}
                
                {isFinderUser && isItemActive && claims.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium flex items-center text-blue-800">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {claims.length} {claims.length === 1 ? 'person has' : 'people have'} claimed this item
                    </h3>
                    <p className="text-sm text-blue-700 mt-1 mb-3">
                      Review the claims and approve the one that matches the item's description.
                    </p>
                    <div className="space-y-2">
                      {claims.map(claim => (
                        <Button 
                          key={claim.id}
                          onClick={() => handleReviewClaim(claim.id)} 
                          variant="outline" 
                          className="w-full border-blue-300 bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          Review Claim #{claim.id.slice(0, 8)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {isItemCompleted && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium flex items-center text-green-800">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      This item has been returned to its owner
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      Great job! Thanks for helping someone find their lost item.
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  {!isFinderUser && isItemActive && (
                    <Button 
                      className="w-full" 
                      onClick={() => setIsClaimModalOpen(true)}
                      disabled={!!userClaim}
                    >
                      {userClaim ? (
                        <span className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Claim Pending
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Claim This Item
                        </span>
                      )}
                    </Button>
                  )}
                  
                  {!isFinderUser && userClaim?.status === 'approved' && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={() => setIsClaimModalOpen(true)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact Finder
                    </Button>
                  )}
                  
                  {(!isAuthenticated || (!userClaim && !isFinderUser && isItemActive)) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant={isAuthenticated ? "outline" : "default"}>
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
                  )}
                  
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
      
      {/* Claim verification modal */}
      <ClaimVerification 
        itemId={item.id}
        itemName={item.item_name}
        finderId={item.user_id}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />
      
      {/* Review claim dialog for finders */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Claim</DialogTitle>
            <DialogDescription>
              Carefully review the claimer's description to verify if they are the true owner.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {selectedClaimId && claims.find(c => c.id === selectedClaimId) && (
              <>
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Owner's Description:</h3>
                  <p className="text-sm">
                    {claims.find(c => c.id === selectedClaimId)?.owner_description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Your Item Description:</h3>
                  <p className="text-sm">{item.description}</p>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="flex space-x-2">
            <Button 
              variant="outline" 
              className="border-red-200 hover:bg-red-50 text-red-700"
              onClick={() => handleClaimAction('reject')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Claim
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleClaimAction('approve')}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Handover confirmation dialog */}
      <Dialog open={isHandoverDialogOpen} onOpenChange={setIsHandoverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Item Return</DialogTitle>
            <DialogDescription>
              Please confirm that you have returned the item to its owner.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm">
              Once confirmed, this item will be marked as "Returned to Owner" and will be removed from active listings.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHandoverDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkCompleted}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ItemDetails;
