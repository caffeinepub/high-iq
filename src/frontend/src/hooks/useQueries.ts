import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, QuestionDTO, IQTestScoreReport, SessionAttempt } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetRecommendedQuestions() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      difficulty,
      tolerance,
      count,
    }: {
      difficulty: number;
      tolerance: number;
      count: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getRecommendedQuestions(difficulty, tolerance, count);
    },
  });
}

export function useSubmitAnswer() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      questionId,
      chosenAnswerIndex,
      responseTime,
    }: {
      questionId: string;
      chosenAnswerIndex: bigint;
      responseTime: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitAnswer(questionId, chosenAnswerIndex, responseTime);
    },
  });
}

export function useCalculateIQScore() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ attempts, elapsedTime }: { attempts: SessionAttempt[]; elapsedTime: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.calculateIQScore(attempts, elapsedTime);
    },
  });
}

export function useGetQuestionCount() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['questionCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getQuestionCount();
    },
    enabled: !!actor && !actorFetching,
  });
}
