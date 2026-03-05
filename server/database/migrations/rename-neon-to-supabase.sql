-- Migration: Rename neon_auth_id to supabase_auth_id
-- Run this against your database to update the column name

ALTER TABLE users RENAME COLUMN neon_auth_id TO supabase_auth_id;
