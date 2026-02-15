import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetRecommendedQuestions, useSubmitAnswer, useCalculateIQScore } from '../hooks/useQueries';
import RequireAuth from '../components/RequireAuth';
import ProgressMeter from '../components/ProgressMeter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, WifiOff } from 'lucide-react';
import { ADAPTIVE_CONFIG, getNextDifficulty, getTolerance } from '../test/adaptiveLogic';
import type { TestSession, TestAttempt, StoredTestResult } from '../test/sessionTypes';
import type { SessionAttempt } from '../backend';
import { saveTestResult } from '../test/historyStore';
import { toast } from 'sonner';

export default function TestPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const getQuestions = useGetRecommendedQuestions();
  const submitAnswer = useSubmitAnswer();
  const calculateScore = useCalculateIQScore();

  const [session, setSession] = useState<TestSession>({
    currentQuestionIndex: 0,
    currentDifficulty: ADAPTIVE_CONFIG.INITIAL_DIFFICULTY,
    attempts: [],
    startTime: Date.now(),
    currentQuestion: null,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
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

  // Load first question
  useEffect(() => {
    if (!session.currentQuestion && session.currentQuestionIndex === 0) {
      loadNextQuestion();
    }
  }, []);

  const loadNextQuestion = async () => {
    if (!isOnline) {
      toast.error('Cannot load questions while offline. Please check your connection.');
      return;
    }

    try {
      const tolerance = getTolerance(session.currentQuestionIndex + 1);
      const questions = await getQuestions.mutateAsync({
        difficulty: session.currentDifficulty,
        tolerance,
        count: BigInt(1),
      });

      if (questions.length > 0) {
        setSession((prev) => ({
          ...prev,
          currentQuestion: questions[0],
        }));
        setQuestionStartTime(Date.now());
        setSelectedAnswer(null);
        setShowFeedback(false);
        setLastAnswerCorrect(null);
      } else {
        toast.error('No questions available at this difficulty level');
      }
    } catch (error) {
      console.error('Error loading question:', error);
      toast.error('Failed to load question. Please check your connection.');
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !session.currentQuestion) return;

    if (!isOnline) {
      toast.error('Cannot submit answers while offline. Please reconnect to continue.');
      return;
    }

    const responseTime = Date.now() - questionStartTime;

    try {
      const isCorrect = await submitAnswer.mutateAsync({
        questionId: session.currentQuestion.id,
        chosenAnswerIndex: BigInt(selectedAnswer),
        responseTime: BigInt(responseTime),
      });

      setLastAnswerCorrect(isCorrect);
      setShowFeedback(true);

      const attempt: TestAttempt = {
        questionId: session.currentQuestion.id,
        questionText: session.currentQuestion.questionText,
        chosenAnswerIndex: selectedAnswer,
        isCorrect,
        responseTime,
        difficulty: session.currentQuestion.difficulty,
        answers: session.currentQuestion.answers.map((a) => a.answerText),
      };

      const newAttempts = [...session.attempts, attempt];
      const nextDifficulty = getNextDifficulty(session.currentDifficulty, isCorrect);

      setSession((prev) => ({
        ...prev,
        attempts: newAttempts,
        currentDifficulty: nextDifficulty,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));

      // Auto-advance after showing feedback
      setTimeout(() => {
        if (session.currentQuestionIndex + 1 >= ADAPTIVE_CONFIG.MAX_QUESTIONS) {
          finishTest(newAttempts);
        } else {
          loadNextQuestion();
        }
      }, 1500);
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer. Please check your connection.');
    }
  };

  const finishTest = async (attempts: TestAttempt[]) => {
    if (attempts.length < ADAPTIVE_CONFIG.MIN_QUESTIONS) {
      toast.error(`Please complete at least ${ADAPTIVE_CONFIG.MIN_QUESTIONS} questions`);
      return;
    }

    if (!isOnline) {
      toast.error('Cannot calculate score while offline. Please reconnect to finish the test.');
      return;
    }

    try {
      const elapsedTime = Date.now() - session.startTime;
      const sessionAttempts: SessionAttempt[] = attempts.map((a) => ({
        questionId: a.questionId,
        isCorrect: a.isCorrect,
        chosenAnswerIndex: BigInt(a.chosenAnswerIndex),
        responseTime: BigInt(a.responseTime),
        difficulty: a.difficulty,
      }));

      const report = await calculateScore.mutateAsync({
        attempts: sessionAttempts,
        elapsedTime: BigInt(elapsedTime),
      });

      // Save to local storage
      const result: StoredTestResult = {
        id: `test_${Date.now()}`,
        timestamp: Date.now(),
        finalIQScore: Number(report.finalIQScore),
        correctAnswers: Number(report.correctAnswers),
        totalQuestions: attempts.length,
        elapsedTime,
        averageDifficulty: report.averageDifficulty,
        resultSummary: report.resultSummary,
        attempts,
      };

      saveTestResult(result, identity?.getPrincipal().toString());

      navigate({ to: '/results' });
    } catch (error) {
      console.error('Error calculating score:', error);
      toast.error('Failed to calculate score. Please check your connection.');
    }
  };

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          {!isOnline && (
            <Alert variant="destructive" className="border-2">
              <WifiOff className="h-5 w-5" />
              <AlertDescription className="ml-2">
                You're offline. Please reconnect to continue the test. Your progress is saved locally.
              </AlertDescription>
            </Alert>
          )}

          <ProgressMeter
            current={session.currentQuestionIndex + 1}
            total={ADAPTIVE_CONFIG.MAX_QUESTIONS}
          />

          {session.currentQuestion ? (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">
                  Question {session.currentQuestionIndex + 1}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Difficulty: {session.currentQuestion.difficulty.toFixed(1)} / 10
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg leading-relaxed">{session.currentQuestion.questionText}</p>

                <RadioGroup
                  value={selectedAnswer?.toString()}
                  onValueChange={(value) => setSelectedAnswer(parseInt(value))}
                  disabled={showFeedback || !isOnline}
                >
                  <div className="space-y-3">
                    {session.currentQuestion.answers.map((answer, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                          selectedAnswer === index
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        } ${!isOnline ? 'opacity-50' : ''}`}
                      >
                        <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                        <Label
                          htmlFor={`answer-${index}`}
                          className="flex-1 cursor-pointer text-base"
                        >
                          {answer.answerText}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                {showFeedback && (
                  <div
                    className={`flex items-center gap-2 p-4 rounded-lg ${
                      lastAnswerCorrect
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {lastAnswerCorrect ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5" />
                        <span className="font-medium">Incorrect</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null || submitAnswer.isPending || showFeedback || !isOnline}
                    className="flex-1"
                  >
                    {submitAnswer.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Answer'
                    )}
                  </Button>
                  {session.currentQuestionIndex >= ADAPTIVE_CONFIG.MIN_QUESTIONS && (
                    <Button
                      onClick={() => finishTest(session.attempts)}
                      variant="outline"
                      disabled={calculateScore.isPending || !isOnline}
                    >
                      Finish Test
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                {isOnline ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading question...</p>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-8 w-8 mx-auto mb-4 text-destructive" />
                    <p className="text-muted-foreground">Cannot load questions while offline</p>
                    <Button onClick={loadNextQuestion} className="mt-4" disabled={!isOnline}>
                      Retry
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
