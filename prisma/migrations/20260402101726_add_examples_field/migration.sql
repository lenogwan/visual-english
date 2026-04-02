-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Word" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "word" TEXT NOT NULL,
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
INSERT INTO "new_Word" ("audioUrl", "createdAt", "emotionalConnection", "exampleSentence", "id", "images", "meaning", "phonetic", "scenario", "scenarioImages", "tags", "updatedAt", "word") SELECT "audioUrl", "createdAt", "emotionalConnection", "exampleSentence", "id", "images", "meaning", "phonetic", "scenario", "scenarioImages", "tags", "updatedAt", "word" FROM "Word";
DROP TABLE "Word";
ALTER TABLE "new_Word" RENAME TO "Word";
CREATE UNIQUE INDEX "Word_word_key" ON "Word"("word");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
