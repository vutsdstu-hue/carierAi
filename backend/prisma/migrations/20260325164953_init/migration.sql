-- AlterTable
ALTER TABLE "JobApplicationLog" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "note" TEXT;
