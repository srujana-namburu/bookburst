import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem("cookies-accepted");
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookies-accepted", "all");
    setIsVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem("cookies-accepted", "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg z-50 flex flex-col md:flex-row justify-between items-center">
      <p className="text-sm pr-4 mb-4 md:mb-0">
        BookBurst uses cookies to enhance your reading experience. We respect your privacy and only use essential cookies unless you opt in.
      </p>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={acceptEssential}
        >
          Essential Only
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={acceptAll}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Accept All
        </Button>
      </div>
    </div>
  );
}
