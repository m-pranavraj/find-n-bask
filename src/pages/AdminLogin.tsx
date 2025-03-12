
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

// Admin credentials (in a real app, this would be handled server-side)
// These are hardcoded for demonstration purposes only
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "FindBask@2023";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { username, password } = values;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Set admin session in localStorage for demo purposes
      // In a real app, you'd use a more secure method like JWT tokens
      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem("adminLastLogin", new Date().toISOString());
      
      toast.success("Admin login successful", {
        description: "Welcome to the admin dashboard",
      });
      
      navigate("/admin/dashboard");
    } else {
      toast.error("Invalid credentials", {
        description: "Please check your username and password",
      });
    }
  }

  return (
    <MainLayout>
      <div className="container max-w-md mx-auto py-16 px-4">
        <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-muted-foreground mt-2">
              Login to access the admin dashboard
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter admin username" 
                          {...field} 
                        />
                        <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter admin password"
                          {...field}
                        />
                        <div 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" size="lg">
                <Lock className="mr-2 h-4 w-4" />
                Sign In as Admin
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              This is a secured area for administrators only.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminLogin;
