-- AlterTable
ALTER TABLE "password_reset_tokens" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'password_reset';

-- CreateIndex
CREATE INDEX "password_reset_tokens_type_idx" ON "password_reset_tokens"("type");
