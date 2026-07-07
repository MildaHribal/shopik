CREATE TABLE IF NOT EXISTS "email_templates" (
  "key" text PRIMARY KEY,
  "subject" text NOT NULL,
  "headline" text NOT NULL,
  "body" text NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
