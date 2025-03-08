
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import PostFoundItem from "./pages/PostFoundItem";
import SearchLostItems from "./pages/SearchLostItems";
import HowItWorks from "./pages/HowItWorks";
import SuccessStories from "./pages/SuccessStories";
import UserProfile from "./pages/UserProfile";
import ItemDetails from "./pages/ItemDetails";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/success-stories" element={<SuccessStories />} />
            <Route path="/search-lost-items" element={<SearchLostItems />} />
            <Route path="/item-details/:id" element={<ItemDetails />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/post-found-item" element={<PostFoundItem />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
