
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { MapPin, Upload, Search, Shield, MessageCircle, Gift } from "lucide-react";

const HowItWorksPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const findersProcess = [
    {
      step: 1,
      icon: <Upload />,
      title: "Create an Account",
      description: "Sign up with your email or phone number to create a Find & Bask account. This helps build trust in the community."
    },
    {
      step: 2,
      icon: <Upload />,
      title: "Post the Found Item",
      description: "Fill out a form with details about the item you found, including: item name and category, description (color, size, condition), location where you found it, date when you found it, photos of the item (without revealing unique identifying features)."
    },
    {
      step: 3,
      icon: <Shield />,
      title: "Review Ownership Claims",
      description: "When someone claims the item, you'll receive their verification details. Review this information carefully to ensure they're the rightful owner."
    },
    {
      step: 4,
      icon: <MessageCircle />,
      title: "Connect and Return",
      description: "If satisfied with the verification, accept the chat request and arrange a safe meeting place to return the item. You can use our in-app chat to communicate securely."
    },
    {
      step: 5,
      icon: <Gift />,
      title: "Complete the Return",
      description: "After returning the item, mark it as 'Returned' in the app. The owner may offer a reward, though this is entirely optional."
    }
  ];

  const seekersProcess = [
    {
      step: 1,
      icon: <Upload />,
      title: "Create an Account",
      description: "Sign up with your email or phone number to create a Find & Bask account to search for your lost items."
    },
    {
      step: 2,
      icon: <Search />,
      title: "Search for Your Item",
      description: "Use our search filters to look for your lost item: search by location (e.g., 'Waltair Junction, Vizag'), filter by category (e.g., 'Electronics', 'Wallets'), filter by date range, use keywords to find specific items."
    },
    {
      step: 3,
      icon: <Shield />,
      title: "Verify Your Ownership",
      description: "When you find your item, you'll need to verify that you're the rightful owner by providing: detailed description of the item, specific identification marks or features, when and where you purchased/acquired it, optional proof like receipts or photos with the item."
    },
    {
      step: 4,
      icon: <MessageCircle />,
      title: "Connect with the Finder",
      description: "After verification, you can request to chat with the finder. Use our secure in-app messaging to arrange a meeting place and time."
    },
    {
      step: 5,
      icon: <MapPin />,
      title: "Retrieve Your Item",
      description: "Meet the finder at the agreed location to retrieve your item. Consider offering a token of appreciation for their honesty and effort."
    }
  ];

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
              <h1 className="text-4xl font-bold mb-6">How Find & Bask Works</h1>
              <p className="text-lg text-muted-foreground">
                Our platform connects people who have lost items with those who have found them, through a
                secure and trustworthy process.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-accent">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center justify-center mb-12"
            >
              <div className="bg-primary/10 h-14 w-14 rounded-full flex items-center justify-center text-primary mr-4">
                <Upload className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold">For People Who Found Items</h2>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {findersProcess.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="mb-12 last:mb-0 flex"
                >
                  <div className="mr-6 flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-background border border-primary text-foreground flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    {index < findersProcess.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2"></div>
                    )}
                  </div>
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex-1">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center text-primary mr-3">
                        {item.icon}
                      </div>
                      <h3 className="font-semibold text-xl">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center justify-center mb-12"
            >
              <div className="bg-primary/10 h-14 w-14 rounded-full flex items-center justify-center text-primary mr-4">
                <Search className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold">For People Looking for Lost Items</h2>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {seekersProcess.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="mb-12 last:mb-0 flex"
                >
                  <div className="mr-6 flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-background border border-primary text-foreground flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    {index < seekersProcess.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2"></div>
                    )}
                  </div>
                  <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex-1">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center text-primary mr-3">
                        {item.icon}
                      </div>
                      <h3 className="font-semibold text-xl">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
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

export default HowItWorksPage;
