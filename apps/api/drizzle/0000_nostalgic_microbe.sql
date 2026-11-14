CREATE TABLE "accounts" (
	"account_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"timezone" varchar(50) DEFAULT 'Europe/Istanbul' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"round_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"planned_seconds" integer NOT NULL,
	"break_after_seconds" integer NOT NULL,
	"break_length_seconds" integer NOT NULL,
	"phase" varchar(30) NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"break_started_at" timestamp with time zone,
	"resumed_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"outcome" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"room_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(64) NOT NULL,
	"host_account_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"membership_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_entries" (
	"entry_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"credited_seconds" integer NOT NULL,
	"outcome" varchar(20) NOT NULL,
	"closed_at" timestamp with time zone NOT NULL,
	"room_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_entries_round_id_unique" UNIQUE("round_id")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_account_id_accounts_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_account_id_accounts_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_host_account_id_accounts_account_id_fk" FOREIGN KEY ("host_account_id") REFERENCES "public"."accounts"("account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_room_id_rooms_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("room_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_account_id_accounts_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_entries" ADD CONSTRAINT "credit_entries_round_id_rounds_round_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("round_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_entries" ADD CONSTRAINT "credit_entries_account_id_accounts_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_entries" ADD CONSTRAINT "credit_entries_room_id_rooms_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("room_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sessions_account_id" ON "sessions" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_open_round_per_account" ON "rounds" USING btree ("account_id") WHERE phase != 'closed';--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_membership_per_account" ON "memberships" USING btree ("account_id") WHERE left_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_memberships_room_active" ON "memberships" USING btree ("room_id") WHERE left_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_credit_entries_account_closed" ON "credit_entries" USING btree ("account_id","closed_at");--> statement-breakpoint
CREATE INDEX "idx_credit_entries_room" ON "credit_entries" USING btree ("room_id");