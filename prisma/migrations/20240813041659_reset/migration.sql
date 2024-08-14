-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateTable
CREATE TABLE "auth"."User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(30) NOT NULL DEFAULT 'anoymous',
    "bio" TEXT,
    "email" TEXT NOT NULL,
    "imageurl" TEXT DEFAULT '../anonymous-avatar.jpg',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Events" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(50) NOT NULL DEFAULT '無名のイベント',
    "description" TEXT,
    "holderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidates" TIMESTAMP(3)[],

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Participants" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "abscence" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "remarks" TEXT DEFAULT '備考なし',
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "Participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chats" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "auth"."User"("email");

-- CreateIndex
CREATE INDEX "Chats_eventId_idx" ON "public"."Chats"("eventId");

-- AddForeignKey
ALTER TABLE "public"."Events" ADD CONSTRAINT "Events_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "auth"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Participants" ADD CONSTRAINT "Participants_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Participants" ADD CONSTRAINT "Participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chats" ADD CONSTRAINT "Chats_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chats" ADD CONSTRAINT "Chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


