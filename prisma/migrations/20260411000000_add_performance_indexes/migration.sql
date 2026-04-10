-- AlterTable
CREATE INDEX "UserProgress_userId_learned_idx" ON "UserProgress"("userId", "learned");

-- AlterTable
CREATE INDEX "Word_word_idx" ON "Word"("word");

-- AlterTable
CREATE INDEX "PracticeHistory_userId_idx" ON "PracticeHistory"("userId");

-- AlterTable
CREATE INDEX "PracticeHistory_userId_timestamp_idx" ON "PracticeHistory"("userId", "timestamp");

-- AlterTable
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- AlterTable
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");
