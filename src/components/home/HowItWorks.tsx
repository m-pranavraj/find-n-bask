
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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
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
              className="bg-card rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center text-primary mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
