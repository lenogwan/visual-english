-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'User',
    "settings" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Word" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "word" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL DEFAULT 'unknown',
    "senseIndex" INTEGER NOT NULL DEFAULT 0,
    "phonetic" TEXT,
    "audioUrl" TEXT,
    "meaning" TEXT,
    "examples" TEXT NOT NULL DEFAULT '[]',
    "images" TEXT NOT NULL DEFAULT '[]',
    "scenario" TEXT,
    "scenarioImages" TEXT NOT NULL DEFAULT '[]',
    "exampleSentence" TEXT,
    "emotionalConnection" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Word" ("audioUrl", "createdAt", "emotionalConnection", "exampleSentence", "examples", "id", "images", "meaning", "phonetic", "scenario", "scenarioImages", "tags", "updatedAt", "word") SELECT "audioUrl", "createdAt", "emotionalConnection", "exampleSentence", "examples", "id", "images", "meaning", "phonetic", "scenario", "scenarioImages", "tags", "updatedAt", "word" FROM "Word";
DROP TABLE "Word";
ALTER TABLE "new_Word" RENAME TO "Word";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
