CREATE TABLE `agent_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`tick_id` text NOT NULL,
	`user_id` text,
	`decision` text NOT NULL,
	`success` integer NOT NULL,
	`error` text,
	`timestamp` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `agent_memory` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`learning_patterns` text NOT NULL,
	`historical_performance` text NOT NULL,
	`last_updated` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agent_memory_user_id_unique` ON `agent_memory` (`user_id`);--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`key_points` text NOT NULL,
	`difficulty` integer NOT NULL,
	`estimated_minutes` integer NOT NULL,
	`completed` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic` text NOT NULL,
	`title` text NOT NULL,
	`questions` text NOT NULL,
	`difficulty` integer NOT NULL,
	`completed` integer DEFAULT false,
	`score` real,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `user_learning_state` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`current_topic` text NOT NULL,
	`mastery_level` real DEFAULT 0 NOT NULL,
	`last_activity` integer NOT NULL,
	`needs_attention` integer DEFAULT false,
	`recent_scores` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
