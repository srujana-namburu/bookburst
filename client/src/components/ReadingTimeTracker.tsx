import { useEffect } from 'react';
import { usePreferences } from '../context/PreferencesContext';

export function ReadingTimeTracker() {
  const { updateReadingTime } = usePreferences();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let startTime = Date.now();

    const trackTime = () => {
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
      
      if (elapsedSeconds >= 60) { // Update every minute
        updateReadingTime(elapsedSeconds);
        startTime = currentTime;
      }
    };

    interval = setInterval(trackTime, 60000); // Check every minute

    return () => {
      if (interval) {
        clearInterval(interval);
        // Update final reading time when component unmounts
        const finalElapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        if (finalElapsedSeconds > 0) {
          updateReadingTime(finalElapsedSeconds);
        }
      }
    };
  }, [updateReadingTime]);

  return null; // This component doesn't render anything
} 