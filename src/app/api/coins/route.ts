import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get coins with optional filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const creatorFid = searchParams.get('creator_fid');
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = supabase
            .from('coins')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (creatorFid) {
            query = query.eq('creator_fid', parseInt(creatorFid));
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ coins: data });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch coins' }, { status: 500 });
    }
}

// Record a new coin creation
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { creator_fid, coin_address, name, symbol, description, image_url, tx_hash } = body;

        if (!creator_fid || !coin_address || !name || !symbol) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('coins')
            .insert({
                creator_fid,
                coin_address,
                name,
                symbol,
                description,
                image_url,
                tx_hash,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Increment user score for creating a coin
        await supabase.rpc('increment_score', { p_fid: creator_fid, p_amount: 10 });

        return NextResponse.json({ coin: data });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create coin' }, { status: 500 });
    }
}
