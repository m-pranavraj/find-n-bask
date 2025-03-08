
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { MapPin, Calendar, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LostItem {
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
  location: string;
  date: string;
  isClaimed: boolean;
}

const categories = [
  "All Categories",
  "Electronics",
  "Wallets & Purses",
  "Keys",
  "Jewelry",
  "Documents",
  "Bags",
  "Clothing",
  "Accessories",
  "Other"
];

const locations = [
  "All Locations",
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Vizag"
];

const timeFilters = [
  "All Time",
  "Last 24 Hours",
  "Last Week",
  "Last Month",
  "Last 3 Months"
];

const items: LostItem[] = [
  {
    id: 1,
    name: "iPhone 13 Pro",
    category: "Electronics",
    image: "/lovable-uploads/79621265-90bd-40fc-af05-aa7651f40c62.png",
    description: "Found a black iPhone 13 Pro with a cracked screen protector but the phone is in good condition. No SIM card inside.",
    location: "Waltair Junction, Vizag",
    date: "4/15/2025",
    isClaimed: false
  },
  {
    id: 2,
    name: "Brown Leather Wallet",
    category: "Wallets & Purses",
    image: "/lovable-uploads/accf2234-0cbc-4218-8b64-0df3b90e9944.png",
    description: "Found a brown leather wallet with some cards and cash. No ID visible.",
    location: "MG Road, Bangalore",
    date: "4/12/2025",
    isClaimed: false
  },
  {
    id: 3,
    name: "Car Keys with Honda Remote",
    category: "Keys",
    image: "/lovable-uploads/daea1c8e-f648-4f43-9270-878181903513.png",
    description: "Found a set of car keys with Honda remote and a small keychain.",
    location: "Jubilee Hills, Hyderabad",
    date: "4/10/2025",
    isClaimed: true
  },
  {
    id: 4,
    name: "Gold Bracelet",
    category: "Jewelry",
    image: "/lovable-uploads/9b0f615a-1e67-4b42-8d27-e9664debcab2.png",
    description: "Found a gold bracelet with floral design near the food court.",
    location: "Phoenix Mall, Mumbai",
    date: "4/8/2025",
    isClaimed: false
  },
  {
    id: 5,
    name: "Passport",
    category: "Documents",
    image: "/lovable-uploads/daea1c8e-f648-4f43-9270-878181903513.png",
    description: "Found an Indian passport near the ticket counter.",
    location: "Delhi Airport T3",
    date: "4/5/2025",
    isClaimed: false
  },
  {
    id: 6,
    name: "Backpack",
    category: "Bags",
    image: "/lovable-uploads/85b1a914-74bb-4e9c-9ff0-4f7a539970e6.png",
    description: "Found a black Wildcraft backpack with some books inside.",
    location: "Bus Stand, Chennai",
    date: "4/3/2025",
    isClaimed: false
  }
];

const SearchLostItemsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedTime, setSelectedTime] = useState("All Time");
  const [filteredItems, setFilteredItems] = useState<LostItem[]>(items);
  const [activeTab, setActiveTab] = useState("found");

  const handleSearch = () => {
    let filtered = items;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter(item => item.location.includes(selectedLocation));
    }
    
    // Time filter would need actual date logic in a real app
    
    if (activeTab === "found") {
      filtered = filtered.filter(item => !item.isClaimed);
    } else {
      filtered = filtered.filter(item => item.isClaimed);
    }
    
    setFilteredItems(filtered);
  };
  
  useEffect(() => {
    handleSearch();
  }, [activeTab, searchTerm, selectedCategory, selectedLocation, selectedTime]);

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <section className="pt-20 pb-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl font-bold mb-6">Search Lost & Found Items</h1>
              <p className="text-lg text-muted-foreground">
                Looking for something you lost? Search through items that have been found.
              </p>
            </div>
            
            <Tabs 
              defaultValue="found"
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full max-w-3xl mx-auto mb-8"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="found">Found Items</TabsTrigger>
                <TabsTrigger value="claimed">Claimed Items</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="bg-card border border-border rounded-lg p-6 shadow-md max-w-4xl mx-auto mb-12">
              <h2 className="font-semibold text-xl mb-6">Search Filters</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="col-span-1 lg:col-span-4">
                  <Input
                    placeholder="Search by item name or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
                
                <div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
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
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select
                    value={selectedTime}
                    onValueChange={setSelectedTime}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeFilters.map((filter) => (
                        <SelectItem key={filter} value={filter}>
                          {filter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Button onClick={handleSearch} className="w-full">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="relative h-60 overflow-hidden">
                    <span className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                    {item.isClaimed && (
                      <span className="absolute top-4 left-4 bg-primary/80 text-primary-foreground backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
                        Claimed
                      </span>
                    )}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                      <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>{item.date}</span>
                    </div>
                    
                    <Button
                      variant={item.isClaimed ? "secondary" : "default"}
                      className="w-full"
                      disabled={item.isClaimed}
                    >
                      {item.isClaimed ? "Already Claimed" : "View Details"}
                    </Button>
                  </div>
                </motion.div>
              ))}

              {filteredItems.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-muted-foreground mb-2">
                    <Search className="h-12 w-12 mx-auto mb-4" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search filters or check back later.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </motion.div>
    </MainLayout>
  );
};

export default SearchLostItemsPage;
