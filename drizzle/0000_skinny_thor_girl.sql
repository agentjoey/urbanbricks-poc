CREATE TYPE "public"."budget_band" AS ENUM('under-40k', '40k-60k', '60k-90k', '90k-120k', 'over-120k');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('residential', 'commercial');--> statement-breakpoint
CREATE TYPE "public"."timeline" AS ENUM('exploring', '6-12-months', '3-6-months', '1-3-months', 'asap');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"country" text,
	"model_slug" text,
	"project_type" "project_type",
	"timeline" timeline,
	"budget_band" "budget_band",
	"message" text,
	"source_path" text NOT NULL,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"consent_at" timestamp with time zone NOT NULL
);
