
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar } from "lucide-react";

// Define types for our data
interface SuccessStory {
  id: number;
  category: string;
  title: string;
  image: string;
  location: string;
  date: string;
  loserName: string;
  loserStory: string;
  finderName: string;
  finderStory: string;
}

const SuccessStoriesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sample success stories data
  const successStoriesData: SuccessStory[] = [
    {
      id: 1,
      category: "Wallet",
      title: "Lost Wallet Returned with All Cash Intact",
      image: "/lovable-uploads/accf2234-0cbc-4218-8b64-0df3b90e9944.png",
      location: "Connaught Place, Delhi",
      date: "March 15, 2025",
      loserName: "Rahul Sharma",
      loserStory: "I lost my wallet containing all my cards and ₹15,000 in cash while shopping. I was devastated as it had my ID cards and driving license too. I thought I'd never see it again, especially the cash.",
      finderName: "Priya Kapoor",
      finderStory: "I found a wallet while having coffee and immediately posted it on Find & Bask. The verification process made me confident that I was returning it to the right person. It feels great to help someone and know that they got their important belongings back."
    },
    {
      id: 2,
      category: "Jewelry",
      title: "Family Heirloom Watch Recovered",
      image: "/lovable-uploads/f82f5865-0de7-428e-ae3c-a8e44a71dc6a.png",
      location: "Marine Drive, Mumbai",
      date: "February 28, 2025",
      loserName: "Vikram Mehta",
      loserStory: "I lost my grandfather's vintage watch during my morning walk at Marine Drive. It has immense sentimental value as it's a family heirloom passed down for generations. I was heartbroken thinking it was gone forever.",
      finderName: "Ananya Desai",
      finderStory: "I found an antique-looking watch on my evening jog. It looked valuable and I was sure someone was missing it dearly. The verification process was thorough and I could tell by the detailed description that it truly belonged to Vikram. I'm happy it's back with its rightful owner."
    },
    {
      id: 3,
      category: "Electronics",
      title: "Lost Laptop with Critical Work Recovered",
      image: "/lovable-uploads/85b1a914-74bb-4e9c-9ff0-4f7a539970e6.png",
      location: "Cyber Hub, Gurgaon",
      date: "April 5, 2025",
      loserName: "Arjun Khanna",
      loserStory: "I accidentally left my laptop at a café in Cyber Hub. It contained months of work and my upcoming project presentation. I was in panic mode as the deadline was approaching and I had no backups of some crucial files.",
      finderName: "Raj Malhotra",
      finderStory: "I noticed someone had left their laptop at the table next to mine. I waited for a while, but no one returned. I decided to post it on Find & Bask. The verification questions helped confirm the rightful owner, and Arjun was able to provide specific details about the files and software installed."
    },
    {
      id: 4,
      category: "Jewelry",
      title: "Wedding Ring Found After Beach Visit",
      image: "/lovable-uploads/9b0f615a-1e67-4b42-8d27-e9664debcab2.png",
      location: "Juhu Beach, Mumbai",
      date: "January 10, 2025",
      loserName: "Meera Patel",
      loserStory: "I lost my wedding ring while playing volleyball at Juhu Beach. It slipped off my finger, and I spent hours digging through the sand without success. It was devastating as we had just celebrated our 5th anniversary.",
      finderName: "Karan Singhania",
      finderStory: "I was taking an evening walk with my metal detector at Juhu Beach when I found a beautiful wedding ring buried in the sand. I knew it must be precious to someone, so I immediately posted it on Find & Bask. Seeing Meera's joy when she got it back was priceless."
    },
    {
      id: 5,
      category: "Documents",
      title: "Lost Passport Recovered Before International Trip",
      image: "/lovable-uploads/daea1c8e-f648-4f43-9270-878181903513.png",
      location: "Airport Road, Bangalore",
      date: "May 18, 2025",
      loserName: "Siddharth Roy",
      loserStory: "I lost my passport in a cab while heading to the airport for an important business trip. I was in complete panic as the flight was in 48 hours and getting a new passport would take much longer. I had almost given up hope.",
      finderName: "Neha Gupta",
      finderStory: "I found a passport in the back seat of my cab after dropping a passenger. I posted it immediately on Find & Bask and was contacted by Siddharth within hours. After verification, I was able to meet him and return the passport just in time for his international flight."
    },
    {
      id: 6,
      category: "Other",
      title: "Child's Favorite Toy Reunited",
      image: "/lovable-uploads/79621265-90bd-40fc-af05-aa7651f40c62.png",
      location: "City Park, Chennai",
      date: "March 7, 2025",
      loserName: "Kavita Menon",
      loserStory: "My 4-year-old daughter lost her favorite stuffed elephant at City Park. It was a gift from her grandmother who lives abroad. She was inconsolable and couldn't sleep without it. We thought it was gone forever.",
      finderName: "Dhruv Sharma",
      finderStory: "I found a well-loved stuffed elephant at the playground in City Park. It was obvious that it was special to someone. I posted it on Find & Bask, and within a day, I was connected with Kavita. Seeing the joy on her daughter's face when returning the toy was the highlight of my week."
    }
  ];

  const [stories, setStories] = useState<SuccessStory[]>(successStoriesData);
  const [expandedStory, setExpandedStory] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(successStoriesData.map(story => story.category)));

  const filterByCategory = (category: string | null) => {
    setSelectedCategory(category);
    if (category === null) {
      setStories(successStoriesData);
    } else {
      setStories(successStoriesData.filter(story => story.category === category));
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <section className="pt-20 pb-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl font-bold mb-6">Success Stories</h1>
              <p className="text-lg text-muted-foreground">
                Real stories from people who have successfully recovered their lost items or
                helped others find theirs through Find & Bask.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-12">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => filterByCategory(null)}
                className="mb-2"
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => filterByCategory(category)}
                  className="mb-2"
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="relative h-56 overflow-hidden">
                    <span className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
                      {story.category}
                    </span>
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3">{story.title}</h3>
                    
                    <div className="flex items-center text-xs text-muted-foreground mb-5">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{story.location}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{story.date}</span>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center mb-3">
                        <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center text-primary text-xs font-medium">
                          {story.loserName.slice(0, 2)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{story.loserName}</p>
                          <p className="text-xs text-muted-foreground">Lost the item</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-5">
                        {expandedStory === story.id
                          ? story.loserStory
                          : `${story.loserStory.substring(0, 100)}...`}
                      </p>
                      
                      <div className="flex items-center mb-3">
                        <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center text-primary text-xs font-medium">
                          {story.finderName.slice(0, 2)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{story.finderName}</p>
                          <p className="text-xs text-muted-foreground">Found the item</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-5">
                        {expandedStory === story.id
                          ? story.finderStory
                          : `${story.finderStory.substring(0, 100)}...`}
                      </p>
                      
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                      >
                        {expandedStory === story.id ? "Read Less" : "Read Full Story"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </motion.div>
    </MainLayout>
  );
};

export default SuccessStoriesPage;
