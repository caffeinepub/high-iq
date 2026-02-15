import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import RequireAuth from '../components/RequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy, Target, Clock, ChevronRight, FileText } from 'lucide-react';
import { getTestHistory } from '../test/historyStore';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const history = getTestHistory(identity?.getPrincipal().toString());

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'outline' => {
    if (score >= 130) return 'default';
    if (score >= 115) return 'secondary';
    return 'outline';
  };

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Test History</h1>
              <p className="text-muted-foreground mt-1">
                View all your previous IQ test results
              </p>
            </div>
            <Button onClick={() => navigate({ to: '/test' })} className="gap-2">
              <Trophy className="h-4 w-4" />
              New Test
            </Button>
          </div>

          {history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">No Tests Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Take your first IQ test to see your results here
                  </p>
                  <Button onClick={() => navigate({ to: '/test' })}>Start Your First Test</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((result) => (
                <Card
                  key={result.id}
                  className="hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate({ to: `/history/${result.id}` })}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(result.timestamp)}
                        </CardTitle>
                        <Badge variant={getScoreBadgeVariant(result.finalIQScore)}>
                          {result.resultSummary}
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Trophy className="h-3 w-3" />
                          IQ Score
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {result.finalIQScore}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Target className="h-3 w-3" />
                          Accuracy
                        </div>
                        <div className="text-2xl font-bold">
                          {((result.correctAnswers / result.totalQuestions) * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Time
                        </div>
                        <div className="text-2xl font-bold">
                          {Math.floor(result.elapsedTime / 60000)}m
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
