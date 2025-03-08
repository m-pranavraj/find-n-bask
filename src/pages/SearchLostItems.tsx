
import { useState, ChangeEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Search, Calendar, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  "All Categories",
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

const timeframes = [
  "Any Time",
  "Last 24 Hours",
  "Last 7 Days",
  "Last 30 Days",
  "Last 3 Months",
];

interface FoundItem {
  id: string;
  item_name: string;
  category: string;
  location: string;
  description: string;
  images: string[];
  created_at: string;
}

// Custom input component with icon
const SearchInput = ({ 
  icon, 
  ...props 
}: { 
  icon: React.ReactNode 
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        {icon}
      </div>
      <Input {...props} className={`pl-10 ${props.className}`} />
    </div>
  );
};

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

const SearchLostItems = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(timeframes[0]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("newest");
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocationTerm(e.target.value);
  };

  // Log a search query when user performs a search
  const logSearchQuery = async () => {
    if (!user) return;
    
    try {
      await supabase.from('lost_item_queries').insert({
        user_id: user.id,
        query_text: searchTerm,
        category: selectedCategory !== "All Categories" ? selectedCategory : null,
        location: locationTerm,
        timeframe: selectedTimeframe !== "Any Time" ? selectedTimeframe : null
      });
    } catch (error) {
      console.error("Error logging search query:", error);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('found_items')
        .select('*');
      
      // Apply filters
      if (searchTerm) {
        query = query.or(`item_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      if (locationTerm) {
        query = query.ilike('location', `%${locationTerm}%`);
      }
      
      if (selectedCategory !== "All Categories") {
        query = query.eq('category', selectedCategory.toLowerCase());
      }
      
      if (selectedTimeframe !== "Any Time") {
        const now = new Date();
        let timeAgo;
        
        switch (selectedTimeframe) {
          case "Last 24 Hours":
            timeAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
            break;
          case "Last 7 Days":
            timeAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case "Last 30 Days":
            timeAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case "Last 3 Months":
            timeAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
            break;
          default:
            timeAgo = null;
        }
        
        if (timeAgo) {
          query = query.gte('created_at', timeAgo);
        }
      }
      
      // Apply sorting
      if (sortOrder === "newest") {
        query = query.order('created_at', { ascending: false });
      } else if (sortOrder === "oldest") {
        query = query.order('created_at', { ascending: true });
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setFoundItems(data || []);
      
      // Log search query to database
      await logSearchQuery();
      
    } catch (error: any) {
      toast.error("Error searching items", {
        description: error.message || "Please try again later",
      });
      console.error("Error searching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('found_items')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setFoundItems(data || []);
      } catch (error: any) {
        toast.error("Error loading items", {
          description: error.message || "Please try again later",
        });
        console.error("Error loading items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen py-24"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Find Your Lost Item</h1>
            <p className="text-muted-foreground mb-8">
              Search for items that have been found and reported in your area.
              Filter by category, location, and time to narrow down your search.
            </p>
            
            {/* Search filters */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-3">
                  <SearchInput 
                    placeholder="Search by keywords or description" 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full"
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
                
                <div className="col-span-1">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <Input 
                      placeholder="Enter location" 
                      className="pl-10 w-full"
                      value={locationTerm}
                      onChange={handleLocationChange}
                    />
                  </div>
                </div>
                
                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedTimeframe} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeframes.map((timeframe) => (
                        <SelectItem key={timeframe} value={timeframe}>
                          {timeframe}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
                <Button 
                  className="w-full sm:w-auto mb-3 sm:mb-0"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Items
                    </>
                  )}
                </Button>
                
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>
            
            {/* Results */}
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-medium">Results ({foundItems.length})</h2>
              <Select 
                defaultValue={sortOrder}
                onValueChange={(value) => {
                  setSortOrder(value);
                  // Re-sort the results when sort order changes
                  if (value === "newest") {
                    setFoundItems([...foundItems].sort((a, b) => 
                      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    ));
                  } else if (value === "oldest") {
                    setFoundItems([...foundItems].sort((a, b) => 
                      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    ));
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : foundItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foundItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <span className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                      <img
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.item_name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2">{item.item_name}</h3>
                      
                      <div className="flex items-center text-xs text-muted-foreground mb-4">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{item.location}</span>
                        <span className="mx-2">•</span>
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatTimeAgo(item.created_at)}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <Link to={`/item-details/${item.id}`}>
                        <Button variant="default" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-xl font-medium mb-2">No items found</h3>
                <p className="text-muted-foreground mb-8">
                  Try adjusting your search filters or check back later.
                </p>
                <Button
                  variant="default"
                  onClick={() => {
                    setSearchTerm("");
                    setLocationTerm("");
                    setSelectedCategory(categories[0]);
                    setSelectedTimeframe(timeframes[0]);
                    handleSearch();
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
            
            {/* Load more button */}
            {foundItems.length > 0 && (
              <div className="mt-10 text-center">
                <Button variant="outline" size="lg">
                  Load More Items
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default SearchLostItems;
