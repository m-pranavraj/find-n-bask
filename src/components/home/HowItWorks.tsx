
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
      {/* Colorful gradient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.15]"></div>
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-primary font-medium mb-2 bg-primary/10 px-3 py-1 rounded-full text-sm">Simple Process</span>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-primary to-pink-600 bg-clip-text text-transparent">How It Works</h2>
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
              <div className="absolute -right-4 -top-4 h-32 w-32 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full transition-all duration-300 group-hover:scale-[1.2]"></div>
              <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 h-14 w-14 rounded-full flex items-center justify-center mb-6 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:from-primary/30 group-hover:to-purple-500/30">
                <div className="text-primary">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-3 font-playfair">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
              <div className="mt-6 h-1 w-12 bg-gradient-to-r from-primary/60 to-purple-500/60 rounded-full group-hover:w-16 transition-all duration-300"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
