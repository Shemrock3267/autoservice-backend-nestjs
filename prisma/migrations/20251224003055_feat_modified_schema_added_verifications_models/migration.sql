-- CreateEnum
CREATE TYPE "Verification_type" AS ENUM ('Email', 'Phone');

-- CreateTable
CREATE TABLE "Verifications" (
    "verification_id" SERIAL NOT NULL,
    "users_id" INTEGER NOT NULL,
    "type" "Verification_type" NOT NULL,
    "verification_code" VARCHAR(255) NOT NULL,
    "verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'::text),
    "expires_at" TIMESTAMP(6),
    "verified_at" TIMESTAMP(6),

    CONSTRAINT "Verifications_pkey" PRIMARY KEY ("verification_id")
);

-- CreateTable
CREATE TABLE "Verified_emails" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "email" VARCHAR(255),
    "raw" JSON,
    "is_verified" BOOLEAN,

    CONSTRAINT "verified_emails_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_verifications_token" ON "Verifications"("verification_code");

-- CreateIndex
CREATE INDEX "idx_verifications_user_id_type" ON "Verifications"("users_id", "type");

-- AddForeignKey
ALTER TABLE "Verifications" ADD CONSTRAINT "Verifications_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Verified_emails" ADD CONSTRAINT "verified_emails_users_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
