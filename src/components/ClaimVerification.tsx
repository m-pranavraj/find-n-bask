
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, File, Image, FileText, Check, User, Upload, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ChatInterface from "./ChatInterface";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface ClaimVerificationProps {
  itemId: string;
  itemName: string;
  finderId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Define form schema for verification - only description is required
const verificationSchema = z.object({
  description: z.string().min(10, "Please provide a detailed description"),
  identificationMarks: z.string().optional(),
  additionalInfo: z.string().optional(),
  hasReceipt: z.boolean().default(false),
  hasPhoto: z.boolean().default(false),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

const ClaimVerification = ({ itemId, itemName, finderId, isOpen, onClose }: ClaimVerificationProps) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [claimStatus, setClaimStatus] = useState<"initial" | "pending" | "approved" | "rejected">("initial");
  const [claimId, setClaimId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ type: string; url: string; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [viewFullImages, setViewFullImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Initialize form
  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      description: "",
      identificationMarks: "",
      additionalInfo: "",
      hasReceipt: false,
      hasPhoto: false,
    },
  });

  // Check if user already has a claim for this item
  const checkExistingClaim = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('item_claims')
        .select('*')
        .eq('item_id', itemId)
        .eq('claimer_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error checking existing claim:", error);
        return;
      }
      
      if (data) {
        setClaimId(data.id);
        setClaimStatus(data.status as any);
        
        // Parse the verification details from the description
        try {
          const verificationDetails = JSON.parse(data.owner_description);
          form.reset({
            description: verificationDetails.description || "",
            identificationMarks: verificationDetails.identificationMarks || "",
            additionalInfo: verificationDetails.additionalInfo || "",
            hasReceipt: verificationDetails.hasReceipt || false,
            hasPhoto: verificationDetails.hasPhoto || false,
          });
          
          // Load any uploaded files
          if (verificationDetails.files && Array.isArray(verificationDetails.files)) {
            setUploadedFiles(verificationDetails.files);
          }
        } catch (e) {
          // If it's not JSON, assume it's just a description
          form.reset({
            description: data.owner_description,
            identificationMarks: "",
            additionalInfo: "",
            hasReceipt: false,
            hasPhoto: false,
          });
        }
      }
    } catch (error) {
      console.error("Error checking existing claim:", error);
    }
  };
  
  // Use effect hook to check for existing claims when the dialog opens
  useEffect(() => {
    if (isOpen) {
      checkExistingClaim();
    }
  }, [isOpen, user, itemId]);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum file size is 5MB" });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/') && type === 'photo') {
      toast.error("Invalid file type", { description: "Please upload an image file" });
      return;
    }

    if (!file.type.includes('pdf') && !file.type.includes('image/') && type === 'receipt') {
      toast.error("Invalid file type", { description: "Please upload a PDF or image file" });
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a folder for the claim
      const folderPath = `claims/${user.id}/${itemId}`;
      const filePath = `${folderPath}/${Date.now()}-${file.name}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('found-item-images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('found-item-images')
        .getPublicUrl(filePath);
        
      // Add to uploaded files
      setUploadedFiles(prev => [...prev, {
        type,
        url: publicUrl,
        name: file.name
      }]);
      
      // Update form
      if (type === 'receipt') form.setValue('hasReceipt', true);
      if (type === 'photo') form.setValue('hasPhoto', true);
      
      toast.success(`${type === 'receipt' ? 'Receipt' : 'Photo'} uploaded successfully`);

      // Clear the input so the same file can be selected again if needed
      event.target.value = '';
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveFile = async (url: string) => {
    try {
      // Extract the path from the URL
      const path = url.split('found-item-images/')[1];
      
      if (path) {
        await supabase.storage
          .from('found-item-images')
          .remove([path]);
      }
      
      // Remove from state
      setUploadedFiles(uploadedFiles.filter(file => file.url !== url));
      
      // Update form if necessary
      const hasReceipt = uploadedFiles.filter(file => file.type === 'receipt' && file.url !== url).length > 0;
      const hasPhoto = uploadedFiles.filter(file => file.type === 'photo' && file.url !== url).length > 0;
      
      form.setValue('hasReceipt', hasReceipt);
      form.setValue('hasPhoto', hasPhoto);
      
      toast.success("File removed successfully");
    } catch (error: any) {
      console.error("Error removing file:", error);
      toast.error("Error removing file", {
        description: error.message || "Please try again"
      });
    }
  };
  
  const onSubmit = async (values: VerificationFormValues) => {
    if (!user) {
      toast.error("You must be logged in to claim an item");
      return;
    }
    
    setSubmitting(true);
    try {
      // Combine all verification data into a structured JSON
      const verificationData = {
        ...values,
        files: uploadedFiles,
        submittedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('item_claims')
        .insert({
          item_id: itemId,
          claimer_id: user.id,
          owner_description: JSON.stringify(verificationData),
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Claim "{itemName}"</DialogTitle>
            <DialogDescription>
              {claimStatus === "initial" && "Provide verification details to prove your ownership."}
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-accent/40 rounded-lg p-4 border border-accent mb-4">
                  <h3 className="font-medium flex items-center text-primary mb-2">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Verification Requirements
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    To verify your ownership, please provide as many details as possible such as:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-6 list-disc">
                    <li>Detailed description of the item including its contents</li>
                    <li>Any unique identification marks or features</li>
                    <li>Photos of you with the item (if available)</li>
                    <li>Receipts or proof of purchase</li>
                    <li>Any other information that can help verify your ownership</li>
                  </ul>
                </div>
              
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Item Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the item in detail including color, brand, material, etc."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Be as specific as possible. Include details that only the owner would know.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="identificationMarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Identification Marks</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe any scratches, dents, stickers, engravings, or other unique marks"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Any unique marks that can help identify the item as yours
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Information</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any other details that can help verify your ownership"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            E.g., when and where you lost it, what was inside, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="photos" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Upload Photos with the Item</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          Photos of you with the item can help prove ownership
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <Label 
                            htmlFor="photo-upload" 
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/20 rounded-md hover:bg-primary/5 cursor-pointer transition-colors"
                          >
                            <Camera className="h-8 w-8 text-primary/60 mb-2" />
                            <span className="text-sm text-primary/60">Upload photos</span>
                            <span className="text-xs text-muted-foreground">JPG, PNG, GIF up to 5MB</span>
                            <Input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'photo')}
                              disabled={isUploading}
                            />
                          </Label>
                        </div>
                      </div>
                      
                      {/* Preview uploaded photos */}
                      {uploadedFiles.filter(file => file.type === 'photo').length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Uploaded Photos</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {uploadedFiles
                              .filter(file => file.type === 'photo')
                              .map((file, index) => (
                                <div 
                                  key={index} 
                                  className="relative border rounded-md overflow-hidden group"
                                >
                                  <img 
                                    src={file.url} 
                                    alt={file.name} 
                                    className="w-full h-24 object-cover"
                                    onClick={() => {
                                      setSelectedImage(file.url);
                                      setViewFullImages(true);
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemoveFile(file.url)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                                    {file.name}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Upload Receipts or Documents</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          Receipts, warranties, or other documents can help verify your ownership
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <Label 
                            htmlFor="receipt-upload" 
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/20 rounded-md hover:bg-primary/5 cursor-pointer transition-colors"
                          >
                            <FileText className="h-8 w-8 text-primary/60 mb-2" />
                            <span className="text-sm text-primary/60">Upload documents</span>
                            <span className="text-xs text-muted-foreground">PDF, JPG, PNG up to 5MB</span>
                            <Input
                              id="receipt-upload"
                              type="file"
                              accept=".pdf,image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'receipt')}
                              disabled={isUploading}
                            />
                          </Label>
                        </div>
                      </div>
                      
                      {/* Preview uploaded receipts */}
                      {uploadedFiles.filter(file => file.type === 'receipt').length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Uploaded Documents</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {uploadedFiles
                              .filter(file => file.type === 'receipt')
                              .map((file, index) => (
                                <div 
                                  key={index} 
                                  className="relative border rounded-md overflow-hidden group p-2 flex flex-col items-center justify-center h-24"
                                >
                                  <FileText className="h-8 w-8 text-primary/60" />
                                  <span className="text-xs truncate max-w-full px-4">{file.name}</span>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-6 text-xs px-2"
                                      onClick={() => window.open(file.url, '_blank')}
                                    >
                                      View
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="h-6 text-xs px-2"
                                      onClick={() => handleRemoveFile(file.url)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-xs text-center text-muted-foreground">
                    By submitting this claim, you confirm that you are the rightful owner of this item. 
                    Providing false information may result in account suspension.
                  </p>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={submitting || isUploading || !form.formState.isValid}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Claim
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Full image viewer */}
      <Sheet open={viewFullImages} onOpenChange={setViewFullImages}>
        <SheetContent side="bottom" className="h-[90vh] sm:max-w-full">
          <SheetHeader>
            <SheetTitle>Image Preview</SheetTitle>
            <SheetDescription>
              Click outside to close
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-center h-[80vh]">
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Full preview" 
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ClaimVerification;
