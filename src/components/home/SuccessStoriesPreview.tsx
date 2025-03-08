
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";

const successStories = [
  {
    id: 1,
    category: "Wallet",
    title: "Lost Wallet Returned with All Cash Intact",
    image: "/lovable-uploads/accf2234-0cbc-4218-8b64-0df3b90e9944.png",
    location: "Connaught Place, Delhi",
    date: "March 15, 2025",
    loserName: "Rahul Sharma",
    finderName: "Priya Kapoor",
    snippet: "I lost my wallet containing all my cards and ₹15,000 in cash while shopping. I was devastated as it had my ID cards and..."
  },
  {
    id: 2,
    category: "Jewelry",
    title: "Family Heirloom Watch Recovered",
    image: "/lovable-uploads/f82f5865-0de7-428e-ae3c-a8e44a71dc6a.png",
    location: "Marine Drive, Mumbai",
    date: "February 28, 2025",
    loserName: "Vikram Mehta",
    finderName: "Ananya Desai",
    snippet: "I lost my grandfather's vintage watch during my morning walk at Marine Drive. It has immense sentimental value as it's..."
  },
  {
    id: 3,
    category: "Electronics",
    title: "Lost Laptop with Critical Work Recovered",
    image: "/lovable-uploads/85b1a914-74bb-4e9c-9ff0-4f7a539970e6.png",
    location: "Cyber Hub, Gurgaon",
    date: "April 5, 2025",
    loserName: "Arjun Khanna",
    finderName: "Raj Malhotra",
    snippet: "I accidentally left my laptop at a café in Cyber Hub. It contained months of work and my upcoming project presentation. I..."
  }
];

const SuccessStoriesPreview = () => {
  return (
    <section className="py-24 bg-accent">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold">Success Stories</h2>
            <p className="mt-4 text-muted-foreground max-w-xl">
              Real stories from people who have successfully recovered their lost items or
              helped others find theirs through Find & Bask.
            </p>
          </div>
          <Link to="/success-stories">
            <Button variant="outline" className="mt-6 md:mt-0">
              View All Stories
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {successStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <span className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
                  {story.category}
                </span>
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2">{story.title}</h3>
                
                <div className="flex items-center text-xs text-muted-foreground mb-4">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{story.location}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{story.date}</span>
                </div>
                
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center text-primary text-xs font-medium">
                      {story.loserName.slice(0, 2)}
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium">{story.loserName}</p>
                      <p className="text-xs text-muted-foreground">Lost the item</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {story.snippet}
                  </p>
                  
                  <div className="flex items-center mb-3">
                    <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center text-primary text-xs font-medium">
                      {story.finderName.slice(0, 2)}
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium">{story.finderName}</p>
                      <p className="text-xs text-muted-foreground">Found the item</p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" className="w-full mt-4 text-sm">
                    Read Full Story
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesPreview;
