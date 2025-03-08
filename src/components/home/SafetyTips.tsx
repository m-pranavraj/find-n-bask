
import { motion } from "framer-motion";
import { Shield, Clock, BadgeAlert } from "lucide-react";

const safetyTips = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Meeting Safely",
    tips: [
      "Always meet in public, well-lit places",
      "Consider meeting at police stations or public buildings",
      "Bring a friend or family member if possible",
      "Share your meeting details with someone you trust"
    ]
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Protecting Personal Information",
    tips: [
      "Don't share your home address",
      "Use our in-app chat instead of personal contact details initially",
      "Never share financial information",
      "Be cautious about sharing identification documents"
    ]
  },
  {
    icon: <BadgeAlert className="h-6 w-6" />,
    title: "Verifying Authenticity",
    tips: [
      "Ask specific questions that only the owner would know",
      "Request detailed descriptions of hidden features",
      "Trust your instincts if something feels suspicious",
      "Report suspicious behavior to our support team"
    ]
  }
];

const SafetyTips = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold">Safety Tips</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {safetyTips.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="text-primary">
                      {section.icon}
                    </div>
                    <h3 className="font-semibold">{section.title}</h3>
                  </div>
                  
                  <ul className="space-y-2">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span className="text-sm text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SafetyTips;
