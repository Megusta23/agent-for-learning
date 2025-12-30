CREATE TABLE `days` (
	`id` text PRIMARY KEY NOT NULL,
	`roadmap_id` text NOT NULL,
	`day_number` integer NOT NULL,
	`topic` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'locked' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `days_roadmap_id_idx` ON `days` (`roadmap_id`);--> statement-breakpoint
CREATE INDEX `days_status_idx` ON `days` (`status`);--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text,
	`user_id` text NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`tags` text,
	`mastery_level` integer DEFAULT 0 NOT NULL,
	`next_review_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `flashcards_user_id_idx` ON `flashcards` (`user_id`);--> statement-breakpoint
CREATE INDEX `flashcards_day_id_idx` ON `flashcards` (`day_id`);--> statement-breakpoint
CREATE INDEX `flashcards_next_review_idx` ON `flashcards` (`next_review_at`);--> statement-breakpoint
CREATE TABLE `roadmaps` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`total_days` integer NOT NULL,
	`daily_minutes` integer NOT NULL,
	`current_day` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `roadmaps_user_id_idx` ON `roadmaps` (`user_id`);--> statement-breakpoint
CREATE INDEX `roadmaps_status_idx` ON `roadmaps` (`status`);--> statement-breakpoint
DROP INDEX `user_learning_state_needs_attention_idx`;--> statement-breakpoint
ALTER TABLE `lessons` ADD `day_id` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `order` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `day_id` text;