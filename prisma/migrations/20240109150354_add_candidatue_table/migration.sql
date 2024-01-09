-- CreateTable
CREATE TABLE "candidature" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "formId" TEXT NOT NULL,
    "submitted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidature_userId_formId_key" ON "candidature"("userId", "formId");

-- AddForeignKey
ALTER TABLE "candidature" ADD CONSTRAINT "candidature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidature" ADD CONSTRAINT "candidature_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
