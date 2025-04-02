CREATE TYPE "public"."prisoner_status" AS ENUM('under_search', 'found');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('family', 'authority');--> statement-breakpoint
CREATE TABLE "family_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"prisoner_id" integer NOT NULL,
	"relationship" text NOT NULL,
	"is_main_contact" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"prisoner_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"prisoner_id" integer NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prisoners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"age" integer,
	"gender" text,
	"reason_for_capture" text,
	"location_of_disappearance" text,
	"date_of_disappearance" timestamp,
	"additional_info" text,
	"contact_person" text,
	"contact_phone" text,
	"status" "prisoner_status" DEFAULT 'under_search' NOT NULL,
	"is_regular" boolean DEFAULT true,
	"is_civilian" boolean DEFAULT true,
	"released_date" timestamp,
	"released_location" text,
	"released_notes" text,
	"added_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"user_type" "user_type" NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"organization" text,
	"position" text,
	"details" text,
	"token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "family_connections" ADD CONSTRAINT "family_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_connections" ADD CONSTRAINT "family_connections_prisoner_id_prisoners_id_fk" FOREIGN KEY ("prisoner_id") REFERENCES "public"."prisoners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_subscriptions" ADD CONSTRAINT "notification_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_subscriptions" ADD CONSTRAINT "notification_subscriptions_prisoner_id_prisoners_id_fk" FOREIGN KEY ("prisoner_id") REFERENCES "public"."prisoners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_prisoner_id_prisoners_id_fk" FOREIGN KEY ("prisoner_id") REFERENCES "public"."prisoners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prisoners" ADD CONSTRAINT "prisoners_added_by_id_users_id_fk" FOREIGN KEY ("added_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;