CREATE TABLE `agent_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`tick_id` text NOT NULL,
	`user_id` text,
	`decision_type` text NOT NULL,
	`decision_data` text NOT NULL,
	`success` integer NOT NULL,
	`error` text,
	`execution_time_ms` integer,
	`timestamp` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_logs_tick_id_idx` ON `agent_logs` (`tick_id`);--> statement-breakpoint
CREATE INDEX `agent_logs_user_id_idx` ON `agent_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `agent_logs_timestamp_idx` ON `agent_logs` (`timestamp`);--> statement-breakpoint
CREATE TABLE `agent_memory` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`learning_patterns` text NOT NULL,
	`historical_performance` text NOT NULL,
	`last_updated` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agent_memory_user_id_unique` ON `agent_memory` (`user_id`);--> statement-breakpoint
CREATE INDEX `agent_memory_user_id_idx` ON `agent_memory` (`user_id`);--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`key_points` text NOT NULL,
	`difficulty` integer NOT NULL,
	`estimated_minutes` integer NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `lessons_user_id_idx` ON `lessons` (`user_id`);--> statement-breakpoint
CREATE INDEX `lessons_topic_idx` ON `lessons` (`topic`);--> statement-breakpoint
CREATE INDEX `lessons_completed_idx` ON `lessons` (`completed`);--> statement-breakpoint
CREATE TABLE `quiz_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`user_id` text NOT NULL,
	`question_id` text NOT NULL,
	`user_answer` integer NOT NULL,
	`correct_answer` integer NOT NULL,
	`is_correct` integer NOT NULL,
	`time_spent_seconds` integer,
	`submitted_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `quiz_submissions_quiz_id_idx` ON `quiz_submissions` (`quiz_id`);--> statement-breakpoint
CREATE INDEX `quiz_submissions_user_id_idx` ON `quiz_submissions` (`user_id`);--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic` text NOT NULL,
	`title` text NOT NULL,
	`questions` text NOT NULL,
	`difficulty` integer NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`score` real,
	`total_questions` integer DEFAULT 0 NOT NULL,
	`completed_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `quizzes_user_id_idx` ON `quizzes` (`user_id`);--> statement-breakpoint
CREATE INDEX `quizzes_topic_idx` ON `quizzes` (`topic`);--> statement-breakpoint
CREATE INDEX `quizzes_completed_idx` ON `quizzes` (`completed`);--> statement-breakpoint
CREATE TABLE `user_learning_state` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`current_topic` text NOT NULL,
	`mastery_level` real DEFAULT 0 NOT NULL,
	`last_activity` integer NOT NULL,
	`needs_attention` integer DEFAULT false NOT NULL,
	`recent_scores` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `user_learning_state_user_id_idx` ON `user_learning_state` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_learning_state_needs_attention_idx` ON `user_learning_state` (`needs_attention`);