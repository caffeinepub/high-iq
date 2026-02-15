import { useNavigate, useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import RequireAuth from '../components/RequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { getTestResultById } from '../test/historyStore';

export default function AttemptDetailsPage() {
  const navigate = useNavigate();
  const { attemptId } = useParams({ from: '/history/$attemptId' });
  const { identity } = useInternetIdentity();
  const result = getTestResultById(attemptId, identity?.getPrincipal().toString());

  if (!result) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Test result not found</p>
              <Button onClick={() => navigate({ to: '/history' })}>Back to History</Button>
            </CardContent>
          </Card>
        </div>
      </RequireAuth>
    );
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/history' })}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Summary Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Test Results</span>
                <Badge>{result.resultSummary}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{formatDate(result.timestamp)}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">IQ Score</div>
                  <div className="text-3xl font-bold text-primary">{result.finalIQScore}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                  <div className="text-3xl font-bold">
                    {((result.correctAnswers / result.totalQuestions) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Questions</div>
                  <div className="text-3xl font-bold">{result.totalQuestions}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Avg Difficulty</div>
                  <div className="text-3xl font-bold">{result.averageDifficulty.toFixed(1)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Details */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Question Breakdown</h2>
            {result.attempts.map((attempt, index) => (
              <Card key={index} className={attempt.isCorrect ? 'border-green-500/20' : 'border-red-500/20'}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      {attempt.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      )}
                      <span>Question {index + 1}</span>
                    </CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {attempt.difficulty.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {(attempt.responseTime / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed">{attempt.questionText}</p>
                  <div className="space-y-2">
                    {attempt.answers.map((answer, answerIndex) => (
                      <div
                        key={answerIndex}
                        className={`p-3 rounded-lg border text-sm ${
                          answerIndex === attempt.chosenAnswerIndex
                            ? attempt.isCorrect
                              ? 'border-green-500/50 bg-green-500/10'
                              : 'border-red-500/50 bg-red-500/10'
                            : 'border-border bg-muted/30'
                        }`}
                      >
                        {answer}
                        {answerIndex === attempt.chosenAnswerIndex && (
                          <span className="ml-2 text-xs font-medium">
                            (Your answer)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
