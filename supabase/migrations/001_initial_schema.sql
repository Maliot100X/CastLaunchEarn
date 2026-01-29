-- CastLaunchEarn Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced from Farcaster)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fid INTEGER UNIQUE NOT NULL,
  username TEXT,
  display_name TEXT,
  pfp_url TEXT,
  wallet_address TEXT,
  score INTEGER DEFAULT 0,
  is_subscriber BOOLEAN DEFAULT FALSE,
  subscriber_since TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_score ON users(score DESC);
CREATE INDEX IF NOT EXISTS idx_users_fid ON users(fid);

-- Coins created on our platform
CREATE TABLE IF NOT EXISTS coins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_fid INTEGER REFERENCES users(fid),
  coin_address TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coins_creator ON coins(creator_fid);
CREATE INDEX IF NOT EXISTS idx_coins_created ON coins(created_at DESC);

-- Active boosts
CREATE TABLE IF NOT EXISTS boosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coin_id UUID REFERENCES coins(id) ON DELETE CASCADE,
  boost_type TEXT NOT NULL CHECK (boost_type IN ('basic', 'super', 'hyper')),
  price_usd DECIMAL(10,2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  tx_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_boosts_expires ON boosts(expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_boosts_active ON boosts(expires_at) WHERE expires_at > NOW();

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_fid INTEGER REFERENCES users(fid),
  plan TEXT DEFAULT 'monthly' CHECK (plan IN ('trial', 'monthly')),
  amount_usd DECIMAL(10,2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_fid);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(user_fid) WHERE is_active = TRUE;

-- Leaderboard snapshots (for historical data)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_fid INTEGER REFERENCES users(fid),
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
  period_start DATE NOT NULL,
  coins_created INTEGER DEFAULT 0,
  total_volume DECIMAL(20,8) DEFAULT 0,
  holders_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_fid, period_type, period_start)
);

-- Function to increment user score
CREATE OR REPLACE FUNCTION increment_score(p_fid INTEGER, p_amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET score = score + p_amount,
      updated_at = NOW()
  WHERE fid = p_fid;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow read access to all
CREATE POLICY "Allow read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON coins FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON boosts FOR SELECT USING (true);

-- Allow write access for authenticated users (via service role)
CREATE POLICY "Allow insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow insert" ON coins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON boosts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read subscriptions" ON subscriptions FOR SELECT USING (true);

-- Grant access to anon and authenticated roles
GRANT SELECT ON users TO anon, authenticated;
GRANT SELECT ON coins TO anon, authenticated;
GRANT SELECT ON boosts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON users TO service_role;
GRANT SELECT, INSERT ON coins TO service_role;
GRANT SELECT, INSERT ON boosts TO service_role;
GRANT SELECT, INSERT ON subscriptions TO service_role;
