
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, AlertCircle, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ClaimVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  onClaimSubmitted: () => void;
}

const ClaimVerification = ({ isOpen, onClose, itemId, itemName, onClaimSubmitted }: ClaimVerificationProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [proofText, setProofText] = useState("");
  const [identificationInfo, setIdentificationInfo] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitClaim = async () => {
    if (!user) {
      toast.error("You must be logged in to claim an item");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create a claim record in the database
      const { error: claimError } = await supabase
        .from('item_claims')
        .insert({
          item_id: itemId,
          user_id: user.id,
          proof_text: proofText,
          identification_info: identificationInfo,
          contact_info: contactInfo,
          status: "pending" // pending, approved, rejected
        });

      if (claimError) throw claimError;

      // 2. Update item status to "claim_pending"
      const { error: updateError } = await supabase
        .from('found_items')
        .update({ status: "claim_pending" })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Show success message
      toast.success("Claim submitted successfully", {
        description: "The finder will review your claim and contact you soon.",
      });

      // Let parent component know the claim was submitted
      onClaimSubmitted();
      onClose();

    } catch (error: any) {
      toast.error("Error submitting claim", {
        description: error.message || "Please try again later",
      });
      console.error("Error submitting claim:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !proofText.trim()) {
      toast.error("Please provide proof of ownership");
      return;
    }
    if (step === 2 && !identificationInfo.trim()) {
      toast.error("Please provide identification information");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Claim Process: {itemName}</DialogTitle>
          <DialogDescription>
            Please complete all steps to verify your ownership of this item.
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex justify-between mb-6 px-2">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center 
                            ${step === stepNumber 
                              ? 'bg-primary text-primary-foreground' 
                              : step > stepNumber 
                                ? 'bg-green-500 text-white' 
                                : 'bg-muted text-muted-foreground'}`}
              >
                {step > stepNumber ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              <span className="text-xs mt-1 text-muted-foreground">
                {stepNumber === 1 ? 'Ownership Proof' : 
                 stepNumber === 2 ? 'Identification' : 'Contact Info'}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Step 1: Ownership Proof */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ownership-proof">Proof of Ownership</Label>
              <Textarea
                id="ownership-proof"
                placeholder="Describe specific details about the item that only the owner would know (e.g., unique marks, scratches, contents inside, serial number)"
                className="min-h-[150px]"
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                <AlertCircle className="inline h-3 w-3 mr-1" />
                Your claim will be reviewed by the finder. Providing detailed information increases your chances of recovering your item.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Identification */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="identification">Identification Information</Label>
              <Textarea
                id="identification"
                placeholder="Describe how you can verify your identity (e.g., photo ID, purchase receipt, photos of you with the item)"
                className="min-h-[150px]"
                value={identificationInfo}
                onChange={(e) => setIdentificationInfo(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                <AlertCircle className="inline h-3 w-3 mr-1" />
                You will need to provide this verification when meeting the finder.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Contact Information */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="contact-info">Contact Information</Label>
              <Textarea
                id="contact-info"
                placeholder="Provide your preferred contact information (phone number, email, etc.)"
                className="min-h-[100px]"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                <AlertCircle className="inline h-3 w-3 mr-1" />
                This information will only be shared with the finder if your claim is approved.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">What happens next?</Label>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 pl-2">
                <li>The finder will review your claim</li>
                <li>If approved, you'll be able to chat with the finder</li>
                <li>Arrange a safe meeting to retrieve your item</li>
                <li>The item will be marked as claimed after verification</li>
              </ol>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between sm:justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep} type="button">
              Back
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
          )}

          {step < 3 ? (
            <Button onClick={nextStep} type="button">
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmitClaim} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Claim"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimVerification;
