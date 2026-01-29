import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get leaderboard rankings
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'weekly';
        const limit = parseInt(searchParams.get('limit') || '50');

        // Get users ordered by score
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('score', { ascending: false })
            .limit(limit);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add rank to each user
        const rankedUsers = data.map((user: any, index: number) => ({
            ...user,
            rank: index + 1,
        }));

        return NextResponse.json({
            leaderboard: rankedUsers,
            period,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}

// Update user score (internal use)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fid, score_delta, reason } = body;

        if (!fid || score_delta === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase.rpc('increment_score', {
            p_fid: fid,
            p_amount: score_delta,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, reason });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update score' }, { status: 500 });
    }
}
