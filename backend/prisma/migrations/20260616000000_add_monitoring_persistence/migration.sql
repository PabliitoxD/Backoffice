-- CreateTable
CREATE TABLE "MonitoringCheck" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseTimeMs" INTEGER,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoringCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringNote" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoringNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonitoringCheck_service_checkedAt_idx" ON "MonitoringCheck"("service", "checkedAt");

-- CreateIndex
CREATE INDEX "MonitoringNote_service_createdAt_idx" ON "MonitoringNote"("service", "createdAt");
