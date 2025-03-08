
import { useState, ChangeEvent } from "react";
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
import { MapPin, Search, Calendar, Filter } from "lucide-react";

const categories = [
  "All Categories",
  "Mobile Phones",
  "Wallets",
  "Bags",
  "Keys",
  "Jewelry",
  "Documents",
  "Electronics",
  "Others",
];

const timeframes = [
  "Any Time",
  "Last 24 Hours",
  "Last 7 Days",
  "Last 30 Days",
  "Last 3 Months",
];

const lostItems = [
  {
    id: 1,
    title: "iPhone 13 Pro in Blue Silicone Case",
    category: "Mobile Phones",
    image: "/lovable-uploads/daea1c8e-f648-4f43-9270-878181903513.png",
    location: "Andheri Metro Station, Mumbai",
    date: "2 days ago",
    description: "iPhone 13 Pro in dark blue case with scratches on the back. Found near platform 2."
  },
  {
    id: 2,
    title: "Brown Leather Wallet",
    category: "Wallets",
    image: "/lovable-uploads/accf2234-0cbc-4218-8b64-0df3b90e9944.png",
    location: "Connaught Place, Delhi",
    date: "5 days ago",
    description: "Small brown leather wallet with initials 'RK' embossed. No cash inside, has some cards."
  },
  {
    id: 3,
    title: "Gold Chain with Pendant",
    category: "Jewelry",
    image: "/lovable-uploads/f82f5865-0de7-428e-ae3c-a8e44a71dc6a.png",
    location: "Marine Drive, Mumbai",
    date: "1 week ago",
    description: "22ct gold chain with small heart-shaped pendant. Found near the jogging track."
  },
  {
    id: 4,
    title: "Dell XPS 13 Laptop",
    category: "Electronics",
    image: "/lovable-uploads/85b1a914-74bb-4e9c-9ff0-4f7a539970e6.png",
    location: "Cyber Hub, Gurgaon",
    date: "3 days ago",
    description: "Dell XPS 13 laptop (silver) with stickers on the lid. Found in Cafe Coffee Day."
  },
  {
    id: 5,
    title: "Car and House Keys with Red Keychain",
    category: "Keys",
    image: "/lovable-uploads/79621265-90bd-40fc-af05-aa7651f40c62.png",
    location: "Koramangala, Bangalore",
    date: "Yesterday",
    description: "Bundle of keys with a distinctive red leather keychain and Honda car key."
  },
  {
    id: 6,
    title: "Prescription Glasses in Black Case",
    category: "Others",
    image: "/lovable-uploads/9b0f615a-1e67-4b42-8d27-e9664debcab2.png",
    location: "Phoenix Mall, Chennai",
    date: "4 days ago",
    description: "Black-rimmed prescription glasses in a hard black case. Found in the food court."
  }
];

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

const SearchLostItems = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(timeframes[0]);
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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
                <Button className="w-full sm:w-auto mb-3 sm:mb-0">
                  <Search className="mr-2 h-4 w-4" />
                  Search Items
                </Button>
                
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>
            
            {/* Results */}
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-medium">Results ({lostItems.length})</h2>
              <Select defaultValue="newest">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lostItems.map((item) => (
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
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    
                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{item.location}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{item.date}</span>
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
            
            {/* Load more button */}
            <div className="mt-10 text-center">
              <Button variant="outline" size="lg">
                Load More Items
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default SearchLostItems;
