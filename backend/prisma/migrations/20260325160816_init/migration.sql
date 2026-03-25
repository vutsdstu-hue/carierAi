-- CreateEnum
CREATE TYPE "JobApplicationLogAction" AS ENUM ('CREATED', 'UPDATED', 'STATUS_CHANGED', 'DELETED');

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT[],
    "postedTime" TEXT NOT NULL,
    "aiMatch" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationLog" (
    "id" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" "JobApplicationLogAction" NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobApplicationLog_jobId_idx" ON "JobApplicationLog"("jobId");

-- CreateIndex
CREATE INDEX "JobApplicationLog_actorUserId_idx" ON "JobApplicationLog"("actorUserId");

-- AddForeignKey
ALTER TABLE "JobApplicationLog" ADD CONSTRAINT "JobApplicationLog_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationLog" ADD CONSTRAINT "JobApplicationLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
