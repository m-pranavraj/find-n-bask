
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Camera, Upload, X, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import PlaceSearch from "@/components/PlaceSearch";

const formSchema = z.object({
  itemName: z.string().min(2, {
    message: "Item name must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  location: z.string().min(3, {
    message: "Please enter a valid location.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  contactPreference: z.enum(["app", "phone", "email"], {
    required_error: "Please select a contact preference.",
  }),
});

const categories = [
  "Electronics",
  "Wallets & Purses",
  "ID Cards",
  "Keys",
  "Jewelry",
  "Bags",
  "Clothing",
  "Books",
  "Pets",
  "Other",
];

const PostFoundItem = () => {
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState("");

  // Check if user is authenticated
  const { isLoading: isAuthChecking } = useQuery({
    queryKey: ["user-auth-check"],
    queryFn: async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          navigate("/login");
          toast.error("You must be logged in to post a found item");
        }
        return data.user;
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Authentication error", {
          description: "Please try logging in again"
        });
        navigate("/login");
        return null;
      }
    },
    retry: 1,
  });

  // Ensure storage bucket exists
  useEffect(() => {
    const verifyStorageBucket = async () => {
      try {
        const { data: bucketList, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("Error checking storage buckets:", error);
          return;
        }
        
        const foundItemBucket = bucketList.find(bucket => bucket.name === 'found-item-images');
        
        if (!foundItemBucket) {
          console.warn("Storage bucket 'found-item-images' not found.");
        } else {
          console.log("Storage bucket 'found-item-images' exists.");
        }
      } catch (error) {
        console.error("Failed to verify storage bucket:", error);
      }
    };
    
    if (user) {
      verifyStorageBucket();
    }
  }, [user]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      category: "",
      location: "",
      description: "",
      contactPreference: "app",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Limit to maximum 4 images
    if (images.length + files.length > 4) {
      toast.error("You can upload a maximum of 4 images");
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Only accept images
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Update location in form when PlaceSearch value changes
  const handleLocationChange = (value: string) => {
    setLocation(value);
    form.setValue("location", value);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Validate if at least one image is uploaded
    if (images.length === 0) {
      toast.error("Please upload at least one image of the found item");
      return;
    }

    if (!user) {
      // Try to refresh session before redirecting
      try {
        await refreshSession();
        if (!user) {
          toast.error("You must be logged in to post a found item");
          navigate("/login");
          return;
        }
      } catch (error) {
        toast.error("Session expired", {
          description: "Please log in again to continue"
        });
        navigate("/login");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      
      console.log("Starting found item submission process...");
      
      // Refresh session before proceeding with uploads
      await refreshSession();
      
      // Save images and get URLs
      const imageUrls: string[] = [];
      
      console.log(`Uploading ${images.length} images to storage...`);
      
      for (const imageData of images) {
        // Convert base64 to blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const fileExt = blob.type.split('/')[1];
        
        console.log(`Uploading image: ${fileName}.${fileExt}`);
        
        // Upload image to Supabase storage
        const { data, error } = await supabase.storage
          .from('found-item-images')
          .upload(`public/${fileName}.${fileExt}`, blob);
          
        if (error) {
          console.error("Error uploading image:", error);
          throw new Error(`Image upload failed: ${error.message}`);
        }
        
        // Get URL for the uploaded image
        const { data: urlData } = supabase.storage
          .from('found-item-images')
          .getPublicUrl(`public/${fileName}.${fileExt}`);
          
        imageUrls.push(urlData.publicUrl);
      }
      
      console.log("All images uploaded successfully. URLs:", imageUrls);
      console.log("Saving found item data to database...");
      
      // Save found item data to Supabase
      const { data, error } = await supabase
        .from('found_items')
        .insert({
          user_id: user.id,
          item_name: values.itemName,
          category: values.category,
          location: values.location,
          description: values.description,
          contact_preference: values.contactPreference,
          images: imageUrls,
          status: "active" // New field to track item status (active, claimed, archived)
        });
      
      if (error) {
        console.error("Database error details:", error);
        
        if (error.code === "42501") {
          // Permission denied error - try refreshing session and retry once
          console.log("Permission denied error, refreshing session and retrying...");
          await refreshSession();
          
          // Retry the insert operation
          const retryResult = await supabase
            .from('found_items')
            .insert({
              user_id: user.id,
              item_name: values.itemName,
              category: values.category,
              location: values.location,
              description: values.description,
              contact_preference: values.contactPreference,
              images: imageUrls,
              status: "active"
            });
            
          if (retryResult.error) {
            console.error("Retry failed:", retryResult.error);
            throw new Error(`Database error after refresh: ${retryResult.error.message}`);
          }
          
          console.log("Retry successful:", retryResult.data);
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }
      
      console.log("Found item saved successfully:", data);
      
      // Show success toast
      toast.success("Item reported successfully", {
        description: "Thank you for helping someone find their lost item!",
      });

      // Redirect to search page
      setTimeout(() => {
        navigate("/search-lost-items");
      }, 1500);
      
    } catch (error: any) {
      console.error("Full error object:", error);
      
      toast.error("Error submitting item", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MainLayout>
      <div className="container max-w-3xl mx-auto py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Report a Found Item</h1>
            <p className="text-muted-foreground mt-2">
              Help someone find their lost item by reporting it here
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="itemName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Samsung Galaxy Phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category.toLowerCase()}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Where did you find it?</FormLabel>
                      <FormControl>
                        <PlaceSearch 
                          value={field.value} 
                          onChange={handleLocationChange}
                          placeholder="e.g. CMR Central, Visakhapatnam" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the item in detail (color, condition, any identifying marks, etc.)"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Upload Images</FormLabel>
                  <div className="mt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-border">
                          <img
                            src={image}
                            alt={`Item image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-background/80 rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      {images.length < 4 && (
                        <label className="cursor-pointer border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center aspect-square hover:bg-accent transition-colors duration-200">
                          <Camera className="h-6 w-6 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground">
                            {images.length === 0 ? "Add Photos" : "Add More"}
                          </span>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload up to 4 clear images of the item (Max 5MB each)
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="contactPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Preference</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How would you like to be contacted?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="app">In-app messages only</SelectItem>
                          <SelectItem value="phone">Share my phone number</SelectItem>
                          <SelectItem value="email">Share my email</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Found Item
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default PostFoundItem;
