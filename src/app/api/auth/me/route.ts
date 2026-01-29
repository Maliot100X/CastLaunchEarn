import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Authenticate user via Farcaster quickAuth
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        // Verify token with Neynar (in production)
        // For now, decode the JWT-like token from Farcaster
        try {
            // The token from quickAuth contains user info
            const payload = JSON.parse(atob(token.split('.')[1]));

            const userData = {
                fid: payload.fid,
                username: payload.username,
                displayName: payload.displayName,
                pfpUrl: payload.pfpUrl,
            };

            // Upsert user in database
            const { data: user, error } = await supabase
                .from('users')
                .upsert({
                    fid: userData.fid,
                    username: userData.username,
                    display_name: userData.displayName,
                    pfp_url: userData.pfpUrl,
                }, {
                    onConflict: 'fid',
                })
                .select()
                .single();

            if (error) {
                console.error('Database error:', error);
            }

            return NextResponse.json(user || userData);
        } catch {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
