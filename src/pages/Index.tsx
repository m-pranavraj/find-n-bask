
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import SuccessStoriesPreview from "@/components/home/SuccessStoriesPreview";
import FAQ from "@/components/home/FAQ";
import CTASection from "@/components/home/CTASection";
import SafetyTips from "@/components/home/SafetyTips";
import { motion } from "framer-motion";

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-background via-background to-background relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 -left-24 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-40 -right-24 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <Hero />
          <HowItWorks />
          <SuccessStoriesPreview />
          <SafetyTips />
          <FAQ />
          <CTASection />
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Index;
