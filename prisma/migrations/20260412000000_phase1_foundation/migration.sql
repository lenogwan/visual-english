-- AlterTable
ALTER TABLE "User" ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "streakCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "streakFreezes" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "lastActiveDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DailySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "learnCount" INTEGER NOT NULL DEFAULT 0,
    "practiceCount" INTEGER NOT NULL DEFAULT 0,
    "learnCorrect" INTEGER NOT NULL DEFAULT 0,
    "practiceCorrect" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "mode" TEXT,
    "quality" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "responseTimeMs" INTEGER,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailySession_userId_date_key" ON "DailySession"("userId", "date");

-- CreateIndex
CREATE INDEX "DailySession_userId_date_idx" ON "DailySession"("userId", "date");

-- CreateIndex
CREATE INDEX "LearningEvent_userId_sessionId_idx" ON "LearningEvent"("userId", "sessionId");

-- CreateIndex
CREATE INDEX "LearningEvent_userId_eventType_createdAt_idx" ON "LearningEvent"("userId", "eventType", "createdAt");

-- CreateIndex
CREATE INDEX "LearningEvent_userId_wordId_createdAt_idx" ON "LearningEvent"("userId", "wordId", "createdAt");

-- AddForeignKey
ALTER TABLE "DailySession" ADD CONSTRAINT "DailySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DailySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
