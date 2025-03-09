
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, 
  Calendar, 
  Search,
  Filter,
  ChevronRight,
  Loader2,
  AlertCircle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import PlaceSearch from "@/components/PlaceSearch";

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
  "Last Week",
  "Last Month",
];

const SearchLostItems = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedTimeframe, setSelectedTimeframe] = useState("Any Time");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  useEffect(() => {
    const fetchFoundItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from('found_items')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        // Apply search filters if provided
        if (debouncedSearchQuery) {
          query = query.or(`item_name.ilike.%${debouncedSearchQuery}%,description.ilike.%${debouncedSearchQuery}%`);
        }
        
        if (selectedCategory !== "All Categories") {
          query = query.eq('category', selectedCategory.toLowerCase());
        }
        
        if (location) {
          query = query.ilike('location', `%${location}%`);
        }
        
        if (selectedTimeframe !== "Any Time") {
          const now = new Date();
          let timeAgo;
          
          if (selectedTimeframe === "Last 24 Hours") {
            timeAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
          } else if (selectedTimeframe === "Last Week") {
            timeAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          } else if (selectedTimeframe === "Last Month") {
            timeAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          }
          
          if (timeAgo) {
            query = query.gte('created_at', timeAgo);
          }
        }
        
        // Limit the results to 2 items as requested
        query = query.limit(2);
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        setResults(data || []);
      } catch (err: any) {
        console.error("Error fetching found items:", err);
        setError(err.message || "Failed to load found items");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFoundItems();
  }, [debouncedSearchQuery, selectedCategory, selectedTimeframe, location]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already triggered by the useEffect
  };
  
  const handleItemClick = (itemId: string) => {
    navigate(`/item-details/${itemId}`);
  };
  
  // Save search query to history
  const saveSearchQuery = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('lost_item_queries')
          .insert({
            user_id: user.id,
            query_text: searchQuery,
            category: selectedCategory !== "All Categories" ? selectedCategory.toLowerCase() : null,
            location: location || null,
            timeframe: selectedTimeframe !== "Any Time" ? selectedTimeframe : null
          });
      }
    } catch (error) {
      console.error("Error saving search query:", error);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Find Your Lost Item</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Search through items that have been found and reported by our community.
              Provide specific details to improve your search results.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-5 mb-12">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  placeholder="What did you lose? (e.g. black wallet, blue phone)"
                  className="pl-10 py-6 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
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
                  <PlaceSearch
                    value={location}
                    onChange={setLocation}
                    placeholder="Where did you lose it?"
                  />
                </div>

                <div>
                  <Select
                    value={selectedTimeframe}
                    onValueChange={setSelectedTimeframe}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="When" />
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

              <Button 
                type="submit" 
                className="w-full py-6 text-lg" 
                onClick={saveSearchQuery}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </>
                )}
              </Button>
            </form>

            {/* Results */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {isLoading ? "Searching..." : results.length > 0 ? `Found Items (${results.length})` : "No items found"}
                </h2>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Filter className="h-4 w-4 mr-1" /> Filtered by recency
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-800 rounded-lg p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Error loading results</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {results.length === 0 && !isLoading && !error ? (
                <div className="bg-muted rounded-lg p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted-foreground/20 flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No items found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try broadening your search criteria or check back later.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Items are regularly added as they are found.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((item) => (
                    <div
                      key={item.id}
                      className="group border border-border rounded-xl overflow-hidden bg-card hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="grid grid-cols-3 h-full">
                        <div className="col-span-1 relative overflow-hidden">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.item_name}
                              className="h-full w-full object-cover aspect-square group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center aspect-square">
                              <p className="text-muted-foreground text-xs">No image</p>
                            </div>
                          )}
                        </div>
                        <div className="col-span-2 p-4 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                              {item.item_name}
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">{item.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="mb-3">
                              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full inline-block">
                                {item.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <span className="text-primary text-sm flex items-center font-medium">
                              View Details
                              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default SearchLostItems;
