import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Hide reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-4 py-2">
      <div className="container mx-auto max-w-4xl">
        <Alert
          variant={isOnline ? 'default' : 'destructive'}
          className="shadow-lg border-2"
        >
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <WifiOff className="h-5 w-5" />
            )}
            <AlertDescription className="font-medium">
              {isOnline ? (
                <span className="text-green-600 dark:text-green-400">
                  Connection restored! You're back online.
                </span>
              ) : (
                <span>
                  You're offline. Some features may be unavailable. The app will work with cached data.
                </span>
              )}
            </AlertDescription>
          </div>
        </Alert>
      </div>
    </div>
  );
}
