-- CreateTable
CREATE TABLE "tab_credit_requests" (
    "id" UUID NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "currentStatusId" INTEGER NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "monthlyIncome" DECIMAL(18,2) NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL,
    "externalReferenceId" VARCHAR(255),
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tab_credit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tab_request_pii" (
    "idCredit" UUID NOT NULL,
    "fullNameEnc" TEXT NOT NULL,
    "docType" VARCHAR(10) NOT NULL,
    "docNumberEnc" TEXT NOT NULL,
    "docNumberHash" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,

    CONSTRAINT "tab_request_pii_pkey" PRIMARY KEY ("idCredit")
);

-- CreateTable
CREATE TABLE "tab_request_documents" (
    "idDocument" UUID NOT NULL,
    "idCredit" UUID NOT NULL,
    "documentType" VARCHAR(50) NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileHash" VARCHAR(255) NOT NULL,

    CONSTRAINT "tab_request_documents_pkey" PRIMARY KEY ("idDocument")
);

-- CreateTable
CREATE TABLE "tab_country_rules" (
    "idRule" SERIAL NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "ruleName" VARCHAR(255) NOT NULL,
    "ruleValue" DECIMAL(18,4) NOT NULL,
    "operator" VARCHAR(5) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tab_country_rules_pkey" PRIMARY KEY ("idRule")
);

-- CreateTable
CREATE TABLE "tab_bank_providers" (
    "idProvider" INTEGER NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "providerName" VARCHAR(255) NOT NULL,
    "apiConfig" JSONB NOT NULL,

    CONSTRAINT "tab_bank_providers_pkey" PRIMARY KEY ("idProvider")
);

-- CreateTable
CREATE TABLE "tab_bank_cache" (
    "docNumberHash" VARCHAR(255) NOT NULL,
    "providerId" INTEGER NOT NULL,
    "rawResponse" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tab_bank_cache_pkey" PRIMARY KEY ("docNumberHash")
);

-- CreateTable
CREATE TABLE "tab_background_jobs" (
    "idJob" UUID NOT NULL,
    "idCredit" UUID NOT NULL,
    "jobType" VARCHAR(100) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tab_background_jobs_pkey" PRIMARY KEY ("idJob")
);

-- CreateTable
CREATE TABLE "tab_webhook_inbox" (
    "idWebhook" UUID NOT NULL,
    "externalEventId" VARCHAR(255) NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "tab_webhook_inbox_pkey" PRIMARY KEY ("idWebhook")
);

-- CreateTable
CREATE TABLE "tab_status_catalog" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "tab_status_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tab_request_history" (
    "idHistory" UUID NOT NULL,
    "idCredit" UUID NOT NULL,
    "fromStatusId" INTEGER NOT NULL,
    "toStatusId" INTEGER NOT NULL,
    "metadata" JSONB,
    "correlationId" UUID NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tab_request_history_pkey" PRIMARY KEY ("idHistory")
);

-- CreateTable
CREATE TABLE "tab_realtime_events" (
    "idEvent" UUID NOT NULL,
    "idCredit" UUID NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "isConsumed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tab_realtime_events_pkey" PRIMARY KEY ("idEvent")
);

-- CreateTable
CREATE TABLE "tab_idempotency_keys" (
    "idempotencyKey" VARCHAR(255) NOT NULL,
    "responsePayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tab_idempotency_keys_pkey" PRIMARY KEY ("idempotencyKey")
);

-- CreateTable
CREATE TABLE "tab_audit_logs" (
    "idAudit" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "ipAddress" VARCHAR(45) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tab_audit_logs_pkey" PRIMARY KEY ("idAudit")
);

-- CreateIndex
CREATE INDEX "tab_credit_requests_countryCode_idx" ON "tab_credit_requests"("countryCode");

-- CreateIndex
CREATE INDEX "tab_credit_requests_externalReferenceId_idx" ON "tab_credit_requests"("externalReferenceId");

-- CreateIndex
CREATE INDEX "tab_request_pii_docNumberHash_idx" ON "tab_request_pii"("docNumberHash");

-- CreateIndex
CREATE UNIQUE INDEX "tab_webhook_inbox_externalEventId_key" ON "tab_webhook_inbox"("externalEventId");

-- AddForeignKey
ALTER TABLE "tab_credit_requests" ADD CONSTRAINT "tab_credit_requests_currentStatusId_fkey" FOREIGN KEY ("currentStatusId") REFERENCES "tab_status_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_request_pii" ADD CONSTRAINT "tab_request_pii_idCredit_fkey" FOREIGN KEY ("idCredit") REFERENCES "tab_credit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_request_documents" ADD CONSTRAINT "tab_request_documents_idCredit_fkey" FOREIGN KEY ("idCredit") REFERENCES "tab_credit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_bank_cache" ADD CONSTRAINT "tab_bank_cache_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "tab_bank_providers"("idProvider") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_background_jobs" ADD CONSTRAINT "tab_background_jobs_idCredit_fkey" FOREIGN KEY ("idCredit") REFERENCES "tab_credit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_request_history" ADD CONSTRAINT "tab_request_history_idCredit_fkey" FOREIGN KEY ("idCredit") REFERENCES "tab_credit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_realtime_events" ADD CONSTRAINT "tab_realtime_events_idCredit_fkey" FOREIGN KEY ("idCredit") REFERENCES "tab_credit_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
