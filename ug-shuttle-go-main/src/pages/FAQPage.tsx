import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const FAQPage = () => {
  const faqs = [
    {
      question: "How do I track shuttles in real-time?",
      answer: "Simply visit the 'Track Shuttle' page or use our mobile app. You'll see all active shuttles on a live map with their current locations and estimated arrival times."
    },
    {
      question: "Can I book a seat in advance?",
      answer: "Yes! During peak hours, you can reserve seats through your student portal. You'll receive a QR code that you can show to the driver when boarding."
    },
    {
      question: "What are the shuttle operating hours?",
      answer: "Shuttles operate from 6:00 AM to 10:00 PM on weekdays, and 8:00 AM to 8:00 PM on weekends. Extended hours during exam periods."
    },
    {
      question: "How accurate are the arrival predictions?",
      answer: "Our AI-powered system provides arrival predictions with 90%+ accuracy, taking into account traffic, weather, and historical data."
    },
    {
      question: "What if a shuttle breaks down?",
      answer: "You'll receive immediate notifications about service disruptions. Alternative shuttles are automatically dispatched, and we provide real-time updates on delays."
    },
    {
      question: "Is the service free for students?",
      answer: "Yes, the shuttle service is completely free for all registered University of Ghana students and staff with valid ID cards."
    },
    {
      question: "How do I report issues or feedback?",
      answer: "Use the feedback form in your student portal, email us at phillganiyu@gmail.com, or use the in-app support chat feature."
    },
    {
      question: "Can I get notifications for my routes?",
      answer: "Absolutely! You can customize notifications for specific routes, delays, and when shuttles are approaching your location."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <HelpCircle className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about ShuttleGO
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              className="pl-10 py-3 text-base"
              placeholder="Search for answers..."
            />
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 shadow-soft"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-12 p-8 bg-gradient-card rounded-lg">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Our support team is here to help you with any additional questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:phillganiyu@gmail.com" 
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Email Support
              </a>
              <a 
                href="tel:+233508844309" 
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Call Support
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQPage;