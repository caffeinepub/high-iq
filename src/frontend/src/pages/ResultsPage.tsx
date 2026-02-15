import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import RequireAuth from '../components/RequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Clock, Target, TrendingUp, Home, History, WifiOff } from 'lucide-react';
import { getTestHistory } from '../test/historyStore';
import type { StoredTestResult } from '../test/sessionTypes';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [result, setResult] = useState<StoredTestResult | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      const history = getTestHistory(identity?.getPrincipal().toString());
      if (history.length > 0) {
        setResult(history[0]);
      } else {
        navigate({ to: '/' });
      }
    } catch (error) {
      console.error('Error loading test results:', error);
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!result) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading results...</p>
            </CardContent>
          </Card>
        </div>
      </RequireAuth>
    );
  }

  const accuracyPercentage = (result.correctAnswers / result.totalQuestions) * 100;
  const elapsedMinutes = Math.floor(result.elapsedTime / 60000);
  const elapsedSeconds = Math.floor((result.elapsedTime % 60000) / 1000);

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {!isOnline && (
            <Alert className="border-2">
              <WifiOff className="h-5 w-5" />
              <AlertDescription className="ml-2">
                You're viewing cached results. Reconnect to sync with the server or take a new test.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Score Card */}
          <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Test Complete!</CardTitle>
              <p className="text-muted-foreground">Here are your results</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-6xl font-bold bg-gradient-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
                  {result.finalIQScore}
                </div>
                <div className="text-xl font-semibold text-muted-foreground">IQ Score</div>
                <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-sm font-medium text-primary">{result.resultSummary}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold">{accuracyPercentage.toFixed(1)}%</div>
                <Progress value={accuracyPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {result.correctAnswers} correct out of {result.totalQuestions} questions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Time Taken
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold">
                  {elapsedMinutes}:{elapsedSeconds.toString().padStart(2, '0')}
                </div>
                <p className="text-sm text-muted-foreground">
                  Average: {Math.round(result.elapsedTime / result.totalQuestions / 1000)}s per question
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Average Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold">{result.averageDifficulty.toFixed(1)}</div>
                <Progress value={result.averageDifficulty * 10} className="h-2" />
                <p className="text-sm text-muted-foreground">Out of 10.0 difficulty scale</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Test Date
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-lg font-bold">
                  {new Date(result.timestamp).toLocaleDateString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => navigate({ to: '/' })} variant="outline" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button onClick={() => navigate({ to: '/history' })} className="flex-1">
              <History className="mr-2 h-4 w-4" />
              View History
            </Button>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
