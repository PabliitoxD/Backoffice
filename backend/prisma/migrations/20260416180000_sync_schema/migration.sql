-- AlterTable "Producer"
ALTER TABLE "Producer" ADD COLUMN "pixKey" TEXT;

-- AlterTable "Transaction"
ALTER TABLE "Transaction" ADD COLUMN "cardBrand" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "chargebackAt" TIMESTAMP(3);
ALTER TABLE "Transaction" ADD COLUMN "chargebackObservation" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "installments" INTEGER DEFAULT 1;

-- AlterTable "Withdrawal"
ALTER TABLE "Withdrawal" ADD COLUMN "observation" TEXT;
ALTER TABLE "Withdrawal" ADD COLUMN "pixKey" TEXT;
ALTER TABLE "Withdrawal" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "Withdrawal" ADD COLUMN "completedAt" TIMESTAMP(3);

-- CreateTable "ChargebackDefense"
CREATE TABLE "ChargebackDefense" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "acquirerRef" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChargebackDefense_pkey" PRIMARY KEY ("id")
);

-- CreateTable "Receivable"
CREATE TABLE "Receivable" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "installment" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING_FUNDS',
    "expectedAt" TIMESTAMP(3) NOT NULL,
    "availableAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receivable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChargebackDefense" ADD CONSTRAINT "ChargebackDefense_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
