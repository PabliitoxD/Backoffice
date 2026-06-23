-- AlterTable
ALTER TABLE "Producer"
  ADD COLUMN IF NOT EXISTS "bankName"        TEXT,
  ADD COLUMN IF NOT EXISTS "bankAgency"      TEXT,
  ADD COLUMN IF NOT EXISTS "bankAccount"     TEXT,
  ADD COLUMN IF NOT EXISTS "bankAccountType" TEXT,
  ADD COLUMN IF NOT EXISTS "cnae"            TEXT,
  ADD COLUMN IF NOT EXISTS "mcc"             TEXT,
  ADD COLUMN IF NOT EXISTS "isPep"           BOOLEAN NOT NULL DEFAULT false;
