
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "Is there a fee for using Find & Bask?",
    answer: "No, Find & Bask is completely free to use. We believe in building a helpful community where people can return lost items without any financial barriers."
  },
  {
    question: "Are rewards required?",
    answer: "Rewards are completely optional and at the discretion of the item owner. While many people choose to offer a token of appreciation for honesty and effort, it's not mandatory on our platform."
  },
  {
    question: "How long do items stay listed?",
    answer: "Items remain listed for 90 days by default. After that, you can choose to extend the listing or mark the item as unclaimed. For valuable items, we recommend contacting local authorities if no one claims them after a reasonable period."
  },
  {
    question: "What should I do with official documents?",
    answer: "For government-issued IDs, passports, or similar official documents, we recommend also submitting them to the nearest police station or appropriate government office while listing them on our platform."
  },
  {
    question: "How does the verification process work?",
    answer: "When someone claims to be the owner of an item you found, they'll need to provide detailed descriptions and possibly proof of ownership. You'll review these details to determine if they're the rightful owner before arranging to return the item."
  }
];

const FAQ = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="mt-4 text-muted-foreground">
            Find answers to common questions about using Find & Bask.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
