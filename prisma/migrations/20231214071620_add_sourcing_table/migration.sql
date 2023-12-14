-- CreateTable
CREATE TABLE "sourcing" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "formId" TEXT NOT NULL,
    "submitted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sourcing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sourcing_userId_formId_key" ON "sourcing"("userId", "formId");

-- AddForeignKey
ALTER TABLE "sourcing" ADD CONSTRAINT "sourcing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sourcing" ADD CONSTRAINT "sourcing_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
