
import { motion } from "framer-motion";
import { Search, MessageCircle, Upload } from "lucide-react";

const features = [
  {
    icon: <Upload className="h-6 w-6" />,
    title: "Post Found Item",
    description: "Found something? Post details about the item including location, description, and photos."
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Search & Verify",
    description: "Lost something? Search by location and category, then verify your ownership through our secure process."
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Connect & Retrieve",
    description: "Chat securely with the finder, arrange a meeting point, and get your item back safely."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.15]"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-primary font-medium mb-2">Simple Process</span>
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="mt-4 text-muted-foreground">
            Find & Bask makes it easy to connect lost items with their owners
            through a simple process.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-card rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/5 rounded-full transition-all duration-300 group-hover:scale-[1.2]"></div>
              <div className="bg-primary/10 h-14 w-14 rounded-full flex items-center justify-center text-primary mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 font-playfair">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
              <div className="mt-6 h-1 w-12 bg-primary/50 rounded-full"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
