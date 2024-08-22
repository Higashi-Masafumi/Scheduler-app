-- CreateIndex
CREATE INDEX "Events_holderId_idx" ON "public"."Events"("holderId");

-- CreateIndex
CREATE INDEX "Participants_eventId_idx" ON "public"."Participants"("eventId");

-- CreateIndex
CREATE INDEX "Participants_userId_idx" ON "public"."Participants"("userId");
