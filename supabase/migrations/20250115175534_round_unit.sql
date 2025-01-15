/*
  # Create comments table

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `name` (text)
      - `comment` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `comments` table
    - Add policy for public read access
    - Add policy for public insert access
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON comments
  FOR INSERT
  TO public
  WITH CHECK (true);