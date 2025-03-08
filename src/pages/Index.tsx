
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Hero />
        <HowItWorks />
        <SuccessStoriesPreview />
        <SafetyTips />
        <FAQ />
        <CTASection />
      </motion.div>
    </MainLayout>
  );
};

export default Index;
