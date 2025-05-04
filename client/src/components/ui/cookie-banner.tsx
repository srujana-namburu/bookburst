import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { hasConsent, setConsent } from "@/lib/cookie-manager";
import { Info } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already set cookie preferences
    const hasConsented = hasConsent();
    if (!hasConsented) {
      // Delay showing the banner to avoid immediate popup on page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    setConsent(true);
    setIsVisible(false);
  };

  const acceptEssential = () => {
    setConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-start mb-4 md:mb-0 md:pr-8">
          <Info className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            BookBurst uses cookies to enhance your reading experience with personalized recommendations and tracking. 
            We respect your privacy and only use essential cookies unless you opt in.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={acceptEssential}
            className="whitespace-nowrap"
          >
            Essential Only
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={acceptAll}
            className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
