import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get active boosts
export async function GET(request: NextRequest) {
    try {
        const { data, error } = await supabase
            .from('boosts')
            .select(`*, coins(*)`)
            .gt('expires_at', new Date().toISOString())
            .order('expires_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ boosts: data });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch boosts' }, { status: 500 });
    }
}

// Purchase a boost
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { coin_id, boost_type, price_usd, duration_minutes, tx_hash } = body;

        if (!coin_id || !boost_type || !price_usd) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const expiresAt = new Date(Date.now() + duration_minutes * 60 * 1000);

        const { data, error } = await supabase
            .from('boosts')
            .insert({
                coin_id,
                boost_type,
                price_usd,
                expires_at: expiresAt.toISOString(),
                tx_hash,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ boost: data });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to purchase boost' }, { status: 500 });
    }
}
