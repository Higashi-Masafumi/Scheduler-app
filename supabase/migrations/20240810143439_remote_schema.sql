
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

ALTER SCHEMA "public" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."Events" (
    "id" integer NOT NULL,
    "title" character varying(50) DEFAULT '無名のイベント'::character varying NOT NULL,
    "description" "text",
    "holderId" "text" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "candidates" timestamp(3) without time zone[]
);

ALTER TABLE "public"."Events" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."Events_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."Events_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."Events_id_seq" OWNED BY "public"."Events"."id";

CREATE TABLE IF NOT EXISTS "public"."Participants" (
    "id" integer NOT NULL,
    "userId" "text" NOT NULL,
    "abscence" "text"[] DEFAULT ARRAY[]::"text"[],
    "remarks" "text" DEFAULT '備考なし'::"text",
    "eventId" integer NOT NULL
);

ALTER TABLE "public"."Participants" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."Participants_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."Participants_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."Participants_id_seq" OWNED BY "public"."Participants"."id";

CREATE TABLE IF NOT EXISTS "public"."_prisma_migrations" (
    "id" character varying(36) NOT NULL,
    "checksum" character varying(64) NOT NULL,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) NOT NULL,
    "logs" "text",
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applied_steps_count" integer DEFAULT 0 NOT NULL
);

ALTER TABLE "public"."_prisma_migrations" OWNER TO "postgres";

ALTER TABLE ONLY "public"."Events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."Events_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."Participants" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."Participants_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."Events"
    ADD CONSTRAINT "Events_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Participants"
    ADD CONSTRAINT "Participants_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."_prisma_migrations"
    ADD CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."Events"
    ADD CONSTRAINT "Events_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "auth"."User"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."Participants"
    ADD CONSTRAINT "Participants_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Events"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."Participants"
    ADD CONSTRAINT "Participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."User"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;

RESET ALL;
