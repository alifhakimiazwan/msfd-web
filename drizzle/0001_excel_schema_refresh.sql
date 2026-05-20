-- Rename ticket size raw columns to notes columns
ALTER TABLE "grants" RENAME COLUMN "ticket_size_min_raw" TO "ticket_size_min_notes";--> statement-breakpoint
ALTER TABLE "grants" RENAME COLUMN "ticket_size_max_raw" TO "ticket_size_max_notes";--> statement-breakpoint

-- Convert financing_type_category (single text) to financing_type_categories (text array)
ALTER TABLE "grants" RENAME COLUMN "financing_type_category" TO "financing_type_categories";--> statement-breakpoint
ALTER TABLE "grants" ALTER COLUMN "financing_type_categories" TYPE text[] USING ARRAY["financing_type_categories"]::text[];--> statement-breakpoint

-- Add company_stages array for filterable stage values
ALTER TABLE "grants" ADD COLUMN "company_stages" text[];
