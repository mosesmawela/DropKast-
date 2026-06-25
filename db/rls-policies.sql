-- DROPKAST Row Level Security Policies
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Requires: Supabase project with auth enabled

-- ============================================================================
-- ENABLE RLS ON ALL USER-SCOPED TABLES
-- ============================================================================

ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE anr_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE dj_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: Users can only access their own data
-- ============================================================================

-- Releases: user owns via user_id
CREATE POLICY "Users own releases" ON releases 
  FOR ALL USING (user_id = auth.uid());

-- Campaigns: user owns via release → user_id
CREATE POLICY "Users own campaigns" ON campaigns 
  FOR ALL USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

-- Splits: user owns via release → user_id
CREATE POLICY "Users own splits" ON splits 
  FOR ALL USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

-- Royalty lines: user owns via release → user_id
CREATE POLICY "Users own royalty_lines" ON royalty_lines 
  FOR ALL USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

-- Payouts: user owns via release → user_id
CREATE POLICY "Users own payouts" ON payouts 
  FOR ALL USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

-- Creator accounts: user owns via email match
CREATE POLICY "Users own creator_accounts" ON creator_accounts 
  FOR ALL USING (payee_email = auth.email());

-- Verified posts: user owns via influencer → user_id (if you add user_id to influencers)
-- For now: allow authenticated users to read, admins to write
CREATE POLICY "Authenticated read verified_posts" ON verified_posts 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write verified_posts" ON verified_posts 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- AI usage: user owns via user_id
CREATE POLICY "Users own ai_usage" ON ai_usage 
  FOR ALL USING (user_id = auth.uid());

-- A&R submissions: user owns via user_id
CREATE POLICY "Users own anr_submissions" ON anr_submissions 
  FOR ALL USING (user_id = auth.uid());

-- Pre-releases: user owns via user_id
CREATE POLICY "Users own pre_releases" ON pre_releases 
  FOR ALL USING (user_id = auth.uid());

-- Analytics events: user owns via user_id
CREATE POLICY "Users own analytics_events" ON analytics_events 
  FOR ALL USING (user_id = auth.uid());

-- Influencer campaigns: user owns via campaign → release → user_id
CREATE POLICY "Users own influencer_campaigns" ON influencer_campaigns 
  FOR ALL USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN releases r ON c.release_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

-- DJ sends: user owns via release → user_id
CREATE POLICY "Users own dj_sends" ON dj_sends 
  FOR ALL USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

-- Promo packs: user owns via release → user_id
CREATE POLICY "Users own promo_packs" ON promo_packs 
  FOR ALL USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

-- UGC assets: user owns via release → user_id
CREATE POLICY "Users own ugc_assets" ON ugc_assets 
  FOR ALL USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

-- Automations: user owns via release → user_id
CREATE POLICY "Users own automations" ON automations 
  FOR ALL USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

-- ============================================================================
-- ADMIN BYPASS (optional - requires custom JWT claim)
-- ============================================================================

-- If you add a custom claim to admin users' JWT:
-- CREATE POLICY "Admin full access" ON releases FOR ALL USING (auth.jwt()->>'role' = 'admin');
-- Repeat for each table...

-- ============================================================================
-- VERIFY POLICIES
-- ============================================================================

-- Check policies are created:
-- SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('releases','campaigns','splits','payouts','ai_usage','anr_submissions','pre_releases','analytics_events');