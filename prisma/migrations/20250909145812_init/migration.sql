-- CreateEnum
CREATE TYPE "public"."Severity" AS ENUM ('LOW', 'MED', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."WatchList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "terms" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "public"."Severity" NOT NULL DEFAULT 'LOW',
    "aiSummary" TEXT,
    "aiSuggestion" TEXT,
    "watchListId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_watchListId_fkey" FOREIGN KEY ("watchListId") REFERENCES "public"."WatchList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
