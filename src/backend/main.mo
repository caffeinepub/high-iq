import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import List "mo:core/List";
import Char "mo:core/Char";

actor {
  type Attempt = {
    questionId : Text;
    chosenAnswer : Text;
    isCorrect : Bool;
    responseTime : Nat;
    difficulty : Float;
  };

  type Question = {
    id : Text;
    difficulty : Float;
    questionText : Text;
    answers : [Answer];
    explanation : Text;
  };

  type QuestionDTO = {
    id : Text;
    difficulty : Float;
    questionText : Text;
    answers : [AnswerDTO];
    explanation : Text;
  };

  type Answer = {
    answerText : Text;
    isCorrect : Bool;
  };

  type AnswerDTO = {
    answerText : Text;
  };

  type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type SessionAttempt = {
    questionId : Text;
    isCorrect : Bool;
    chosenAnswerIndex : Nat;
    responseTime : Nat;
    difficulty : Float;
  };

  type IQTestScoreReport = {
    attempts : [SessionAttempt];
    elapsedTime : Nat;
    correctAnswers : Nat;
    averageDifficulty : Float;
    resultSummary : Text;
    finalIQScore : Nat;
    normalizedIQScore : Float;
  };

  let MAX_QUESTIONS_PER_TEST = 20;
  let MIN_QUESTIONS_FOR_SCORING = 5;

  var questionCounter = 0;
  let questions = Map.empty<Text, Question>();
  let userQuestionScores = Map.empty<Principal, Map.Map<Text, Nat>>();
  let scoreCache = Map.empty<Principal.Principal, IQTestScoreReport>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  func difficultyCompare(a : Question, b : Question) : Order.Order {
    Float.compare(a.difficulty, b.difficulty);
  };

  func getDifficultyRange(difficulty : Float, range : Float) : [Question] {
    questions.values().toArray().filter(
      func(q) {
        q.difficulty >= (difficulty - range) and q.difficulty <= (difficulty + range)
      }
    );
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin-only: Add question to the bank
  public shared ({ caller }) func addQuestion(
    difficulty : Float,
    questionText : Text,
    answers : [Answer],
    explanation : Text
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add questions");
    };

    questionCounter += 1;
    let questionId = "q" # questionCounter.toText();
    let question : Question = {
      id = questionId;
      difficulty;
      questionText;
      answers;
      explanation;
    };
    questions.add(questionId, question);
    questionId;
  };

  // Admin-only: Update existing question
  public shared ({ caller }) func updateQuestion(
    questionId : Text,
    difficulty : Float,
    questionText : Text,
    answers : [Answer],
    explanation : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update questions");
    };

    switch (questions.get(questionId)) {
      case (null) { Runtime.trap("Question not found") };
      case (?_) {
        let question : Question = {
          id = questionId;
          difficulty;
          questionText;
          answers;
          explanation;
        };
        questions.add(questionId, question);
      };
    };
  };

  // Admin-only: Delete question
  public shared ({ caller }) func deleteQuestion(questionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete questions");
    };

    switch (questions.get(questionId)) {
      case (null) { Runtime.trap("Question not found") };
      case (?_) {
        ignore questions.remove(questionId);
      };
    };
  };

  // User-only: Submit answer during test
  public shared ({ caller }) func submitAnswer(questionId : Text, chosenAnswerIndex : Nat, responseTime : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit answers");
    };

    let question = switch (questions.get(questionId)) {
      case (null) { Runtime.trap("Question not found") };
      case (?q) { q };
    };

    if (chosenAnswerIndex >= question.answers.size()) {
      Runtime.trap("Invalid answer index");
    };

    let isCorrect = question.answers[chosenAnswerIndex].isCorrect;

    let userScores = switch (userQuestionScores.get(caller)) {
      case (null) {
        let newMap = Map.empty<Text, Nat>();
        userQuestionScores.add(caller, newMap);
        newMap;
      };
      case (?existingMap) { existingMap };
    };

    let currentScore = switch (userScores.get(questionId)) {
      case (null) { 0 };
      case (?score) { score };
    };

    userScores.add(questionId, if (isCorrect) { currentScore + 1 } else { currentScore });

    isCorrect;
  };

  // User-only: Get recommended questions for adaptive testing
  public shared ({ caller }) func getRecommendedQuestions(difficulty : Float, tolerance : Float, count : Nat) : async [QuestionDTO] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get recommended questions");
    };

    let candidates = getDifficultyRange(difficulty, tolerance);
    let slicedCandidates = if (candidates.size() > count) {
      Array.tabulate(count, func(i) { candidates[i] });
    } else {
      candidates;
    };
    slicedCandidates.map<Question, QuestionDTO>(
      func(q) {
        {
          id = q.id;
          difficulty = q.difficulty;
          questionText = q.questionText;
          answers = q.answers.map<Answer, AnswerDTO>(
            func(ans) {
              {
                answerText = ans.answerText;
              };
            }
          );
          explanation = q.explanation;
        };
      }
    );
  };

  // User-only: Calculate IQ score after completing test
  public shared ({ caller }) func calculateIQScore(attempts : [SessionAttempt], elapsedTime : Nat) : async IQTestScoreReport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate IQ scores");
    };

    if (attempts.size() < MIN_QUESTIONS_FOR_SCORING) {
      Runtime.trap("Must complete at least 5 questions for scoring");
    };

    let totalCorrect = attempts.foldLeft(0, func(acc, att) { acc + (if (att.isCorrect) { 1 } else { 0 }) });
    let totalAttempts = attempts.size();
    let avgDifficulty = attempts.foldLeft(0.0, func(acc, att) { acc + att.difficulty }) / totalAttempts.toFloat();
    let correctAttempts = attempts.filter(func(att) { att.isCorrect });
    let baseScore = 80.0 + (avgDifficulty * 10.0);
    let difficultyFactor = if (totalCorrect > 0) { correctAttempts.size().toFloat() / totalCorrect.toFloat() } else { 0.0 };
    let rawIQScore = baseScore + (difficultyFactor * 15.0);

    let normalizedIQScore = switch (rawIQScore) {
      case (raw) {
        if (raw < 50.0) { 50.0 } else if (raw > 150.0) { 150.0 } else { raw };
      };
    };

    let resultSummary = switch (normalizedIQScore) {
      case (score) {
        if (score >= 130.0) {
          "Exceptional";
        } else if (score >= 115.0) {
          "Above Average";
        } else if (score >= 85.0) {
          "Average";
        } else { "Below Average" };
      };
    };

    let report : IQTestScoreReport = {
      attempts;
      elapsedTime;
      finalIQScore = Int.abs(normalizedIQScore.toInt());
      averageDifficulty = avgDifficulty;
      normalizedIQScore;
      correctAnswers = totalCorrect;
      resultSummary;
    };

    scoreCache.add(caller, report);
    report;
  };

  // User can view own score, admin can view any score
  public query ({ caller }) func getCachedScore(user : Principal) : async ?IQTestScoreReport {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own score");
    };
    scoreCache.get(user);
  };

  // Public query: Get total question count (available to all including guests)
  public query ({ caller }) func getQuestionCount() : async Nat {
    questions.size();
  };

  // Public query: Search questions by text (available to all including guests)
  public query ({ caller }) func searchByText(searchText : Text) : async [QuestionDTO] {
    questions.values().toArray().filter(
      func(q) {
        q.questionText.toLower().contains(
          #text (searchText.toLower()),
        );
      }
    ).sort(difficultyCompare).map<Question, QuestionDTO>(
      func(q) {
        {
          id = q.id;
          difficulty = q.difficulty;
          questionText = q.questionText;
          answers = q.answers.map<Answer, AnswerDTO>(func(ans) { { answerText = ans.answerText } });
          explanation = q.explanation;
        };
      }
    );
  };

  // Public query: Get questions in difficulty range (available to all including guests)
  public query ({ caller }) func getQuestionsInRange(minDiff : Float, maxDiff : Float) : async [QuestionDTO] {
    questions.values().toArray().filter(
      func(q) { q.difficulty >= minDiff and q.difficulty <= maxDiff }
    ).sort(difficultyCompare).map<Question, QuestionDTO>(
      func(q) {
        {
          id = q.id;
          difficulty = q.difficulty;
          questionText = q.questionText;
          answers = q.answers.map<Answer, AnswerDTO>(
            func(ans) {
              { answerText = ans.answerText };
            }
          );
          explanation = q.explanation;
        };
      }
    );
  };
};
