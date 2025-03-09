
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChatInterface from "./ChatInterface";

interface ClaimVerificationProps {
  itemId: string;
  itemName: string;
  finderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ClaimVerification = ({ itemId, itemName, finderId, isOpen, onClose }: ClaimVerificationProps) => {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [claimStatus, setClaimStatus] = useState<"initial" | "pending" | "approved" | "rejected">("initial");
  const [claimId, setClaimId] = useState<string | null>(null);
  
  // Check if user already has a claim for this item
  const checkExistingClaim = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('item_claims')
        .select('*')
        .eq('item_id', itemId)
        .eq('claimer_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows found" error
        throw error;
      }
      
      if (data) {
        setClaimId(data.id);
        setClaimStatus(data.status as any);
        setDescription(data.owner_description);
      }
    } catch (error) {
      console.error("Error checking existing claim:", error);
    }
  };
  
  useState(() => {
    if (isOpen) {
      checkExistingClaim();
    }
  });
  
  const handleSubmitClaim = async () => {
    if (!user) {
      toast.error("You must be logged in to claim an item");
      return;
    }
    
    if (!description.trim()) {
      toast.error("Please provide a description to prove ownership");
      return;
    }
    
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('item_claims')
        .insert({
          item_id: itemId,
          claimer_id: user.id,
          owner_description: description,
          status: 'pending'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success("Claim submitted successfully", {
        description: "The finder will review your claim and contact you soon"
      });
      
      setClaimId(data.id);
      setClaimStatus("pending");
    } catch (error: any) {
      toast.error("Failed to submit claim", {
        description: error.message || "Please try again later"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (claimStatus === "approved") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chat with the finder</DialogTitle>
            <DialogDescription>
              Your claim has been approved! Use this chat to arrange the item handover.
            </DialogDescription>
          </DialogHeader>
          
          <ChatInterface 
            itemId={itemId} 
            recipientId={finderId} 
            claimId={claimId || ''} 
          />
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Claim "{itemName}"</DialogTitle>
          <DialogDescription>
            {claimStatus === "initial" && "Provide details that can help verify your ownership."}
            {claimStatus === "pending" && "Your claim is being reviewed by the finder."}
            {claimStatus === "rejected" && "Your claim has been rejected by the finder."}
          </DialogDescription>
        </DialogHeader>
        
        {claimStatus === "pending" && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium mb-2">Claim Under Review</h3>
              <p className="text-muted-foreground text-sm mb-4">
                The finder is currently reviewing your claim. You'll be notified once they respond.
              </p>
            </div>
          </div>
        )}
        
        {claimStatus === "rejected" && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <XCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Claim Rejected</h3>
              <p className="text-muted-foreground text-sm mb-4">
                The finder has determined that the item doesn't match your description.
              </p>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
        
        {claimStatus === "initial" && (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="owner-description">Describe the item in detail to prove ownership</Label>
                <Textarea
                  id="owner-description"
                  placeholder="Please include any specific details, markings, or contents that only the true owner would know..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Be as specific as possible. Include details like serial numbers, unique marks, or contents that only the owner would know.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleSubmitClaim} 
                disabled={submitting || !description.trim()}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Claim"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClaimVerification;
