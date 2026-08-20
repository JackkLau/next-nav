CREATE TYPE "public"."site_category" AS ENUM('common', 'community', 'tools', 'remote', 'personal', 'resources', 'mirror', 'navigation', 'entertainment', 'game');--> statement-breakpoint
CREATE TYPE "public"."site_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "sites" (
	"slug" text PRIMARY KEY NOT NULL,
	"legacy_id" text,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"image_url" text,
	"category" "site_category" NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"description" text,
	"need_vpn" boolean DEFAULT false NOT NULL,
	"source_locale" text DEFAULT 'en' NOT NULL,
	"translations" jsonb,
	"status" "site_status" DEFAULT 'draft' NOT NULL,
	"updated_at" date NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modified_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE UNIQUE INDEX "sites_legacy_id_unique" ON "sites" USING btree ("legacy_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sites_url_unique" ON "sites" USING btree ("url");--> statement-breakpoint
CREATE INDEX "sites_status_category_order_idx" ON "sites" USING btree ("status","category","sort_order");