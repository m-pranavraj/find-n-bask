
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
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
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Items from "./pages/admin/Items";
import Database from "./pages/admin/Database";
import Claims from "./pages/admin/Claims";
import AdminNavbar from "./components/layout/AdminNavbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="system">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AdminNavbar />
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
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/items" element={<Items />} />
              <Route path="/admin/claims" element={<Claims />} />
              <Route path="/admin/database" element={<Database />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
