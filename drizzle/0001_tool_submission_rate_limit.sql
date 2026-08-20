CREATE TABLE "tool_submission_rate_limits" (
	"client_key" text PRIMARY KEY NOT NULL,
	"request_count" smallint DEFAULT 1 NOT NULL,
	"window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"blocked_until" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tool_submission_rate_limits_request_count_check" CHECK ("tool_submission_rate_limits"."request_count" between 1 and 11)
);
--> statement-breakpoint
ALTER TABLE "tool_submission_rate_limits" ENABLE ROW LEVEL SECURITY;