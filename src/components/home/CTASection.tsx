
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Upload, Search } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 mb-12 text-lg">
            Join thousands of users across India who are making a difference by returning lost items to their rightful owners.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/post-found-item">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto group">
                <Upload className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
                Post Found Item
              </Button>
            </Link>
            <Link to="/search-lost-items">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 group">
                <Search className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Search Lost Items
              </Button>
            </Link>
          </div>
          
          <div className="mt-12">
            <Link to="/how-it-works" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <span>Learn more about how it works</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
