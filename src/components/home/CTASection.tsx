
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Upload, Search, Users } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80"></div>
      
      {/* Shape decorations */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-background" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)' }}></div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-background" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)' }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 mb-6">
            <Users className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Join 10,000+ users across India</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-foreground font-playfair">Ready to Get Started?</h2>
          <p className="text-primary-foreground/90 mb-12 text-lg">
            Join thousands of users across India who are making a difference by returning lost items to their rightful owners.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/post-found-item">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto group shadow-lg hover:shadow-xl transition-all">
                <Upload className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
                Post Found Item
              </Button>
            </Link>
            <Link to="/search-lost-items">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 group shadow-lg">
                <Search className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Search Lost Items
              </Button>
            </Link>
          </div>
          
          <div className="mt-12">
            <Link to="/how-it-works" className="inline-flex items-center text-primary-foreground hover:text-primary-foreground/90 transition-colors group">
              <span>Learn more about how it works</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
