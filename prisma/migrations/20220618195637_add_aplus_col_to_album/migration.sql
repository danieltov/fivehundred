/*
  Warnings:

  - You are about to drop the `Tier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `tierId` on the `Album` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Tier_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Tier";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Album" (
    "coverArt" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "lastPlayed" DATETIME,
    "owned" BOOLEAN NOT NULL DEFAULT false,
    "ownedDate" DATETIME,
    "releaseDate" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "isAPlus" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Album" ("coverArt", "id", "lastPlayed", "owned", "ownedDate", "releaseDate", "title") SELECT "coverArt", "id", "lastPlayed", "owned", "ownedDate", "releaseDate", "title" FROM "Album";
DROP TABLE "Album";
ALTER TABLE "new_Album" RENAME TO "Album";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
