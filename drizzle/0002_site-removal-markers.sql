ALTER TABLE "sites" ADD COLUMN "removed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "removal_reason" text;--> statement-breakpoint
CREATE INDEX "sites_active_published_category_page_idx" ON "sites" USING btree ("category","favorite" DESC NULLS LAST,"name","slug") WHERE "sites"."status" = 'published' and "sites"."removed_at" is null;