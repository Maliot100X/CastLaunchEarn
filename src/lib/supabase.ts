import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Create Supabase client with proper headers
export const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        },
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    })
    : null as any;

// Helper to check if supabase is configured
export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseKey);

// Database types
export interface User {
    id: string;
    fid: number;
    username?: string;
    display_name?: string;
    pfp_url?: string;
    wallet_address?: string;
    score: number;
    is_subscriber: boolean;
    subscriber_since?: string;
    created_at: string;
    updated_at: string;
}

export interface Coin {
    id: string;
    creator_fid: number;
    coin_address: string;
    name: string;
    symbol: string;
    description?: string;
    image_url?: string;
    tx_hash?: string;
    created_at: string;
}

export interface Boost {
    id: string;
    coin_id: string;
    boost_type: 'basic' | 'super' | 'hyper';
    price_usd: number;
    started_at: string;
    expires_at: string;
    tx_hash?: string;
}

export interface Subscription {
    id: string;
    user_fid: number;
    plan: 'trial' | 'monthly';
    amount_usd: number;
    started_at: string;
    expires_at: string;
    is_active: boolean;
}

export interface LeaderboardEntry {
    id: string;
    user_fid: number;
    period_type: 'weekly' | 'monthly';
    period_start: string;
    coins_created: number;
    total_volume: number;
    holders_count: number;
    shares_count: number;
    total_score: number;
    rank: number;
}
