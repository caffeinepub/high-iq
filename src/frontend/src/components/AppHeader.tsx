import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import LoginButton from './LoginButton';
import { Brain, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-3 group transition-transform hover:scale-105"
        >
          <img
            src="/assets/generated/high-iq-logo.dim_512x512.png"
            alt="High IQ Logo"
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col items-start">
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
              High IQ
            </span>
            <span className="text-xs text-muted-foreground -mt-1">Adaptive Intelligence Testing</span>
          </div>
        </button>

        <nav className="flex items-center gap-2">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/history' })}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
          )}
          <LoginButton />
        </nav>
      </div>
    </header>
  );
}
