
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
      className="relative overflow-hidden rounded-full"
    >
      <div className="relative z-10">
        <motion.div
          initial={false}
          animate={{ 
            rotate: theme === "light" ? 0 : 180,
            opacity: theme === "light" ? 0 : 1 
          }}
          transition={{ duration: 0.4 }}
          className={`absolute inset-0 flex items-center justify-center ${theme === "light" ? "opacity-0" : "opacity-100"}`}
        >
          <Moon className="h-5 w-5" />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{ 
            rotate: theme === "dark" ? 180 : 0,
            opacity: theme === "dark" ? 0 : 1 
          }}
          transition={{ duration: 0.4 }}
          className={`flex items-center justify-center ${theme === "dark" ? "opacity-0" : "opacity-100"}`}
        >
          <Sun className="h-5 w-5" />
        </motion.div>
      </div>
      
      {/* Ripple effect */}
      <motion.div 
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-primary/20 rounded-full"
        key={theme}
      />
    </Button>
  );
}
