
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Upload } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-background min-h-[70vh] flex items-center overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 top-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              Lost Something?
              <span className="block mt-2">Find It Here.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-6 text-lg text-muted-foreground"
            >
              Connect with people who found your lost items or report items you found to help
              others. Building a more helpful community together.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link to="/post-found-item">
                <Button size="lg" className="w-full sm:w-auto group">
                  <Upload className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
                  Post Found Item
                </Button>
              </Link>
              <Link to="/search-lost-items">
                <Button size="lg" variant="outline" className="w-full sm:w-auto group">
                  <Search className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Search Lost Items
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="hidden lg:block relative"
          >
            <img
              src="/lovable-uploads/112de231-8863-4050-99fd-e2a960e7fb26.png"
              alt="Lost and found items illustration"
              className="w-full h-auto max-w-lg mx-auto rounded-lg shadow-2xl"
            />
            
            <div className="absolute -bottom-6 -left-6 p-4 bg-card border border-border rounded-lg shadow-lg max-w-xs">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary">🎉</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Item successfully returned!</p>
                  <p className="text-xs text-muted-foreground mt-1">Wallet returned to owner at MG Road</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
