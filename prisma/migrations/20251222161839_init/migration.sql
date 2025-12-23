-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "firstname" VARCHAR(255),
    "lastname" VARCHAR(255),
    "username" VARCHAR(255),
    "password" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(255),
    "created_date" TIMESTAMP(6) DEFAULT (now())::timestamp without time zone,
    "otp" VARCHAR(255),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);
