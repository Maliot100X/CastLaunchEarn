import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Farcaster Mini App webhook handler
// Receives notifications about user interactions
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { event, data } = body;

        console.log('Webhook received:', event, data);

        switch (event) {
            case 'frame_added':
                // User added our mini app
                if (data?.fid) {
                    await supabase.from('users').upsert({
                        fid: data.fid,
                        created_at: new Date().toISOString(),
                    }, { onConflict: 'fid' });
                }
                break;

            case 'frame_removed':
                // User removed our mini app
                console.log('User removed app:', data?.fid);
                break;

            case 'notifications_enabled':
                // User enabled notifications
                if (data?.fid) {
                    await supabase.from('users').update({
                        notifications_enabled: true,
                    }).eq('fid', data.fid);
                }
                break;

            case 'notifications_disabled':
                // User disabled notifications
                if (data?.fid) {
                    await supabase.from('users').update({
                        notifications_enabled: false,
                    }).eq('fid', data.fid);
                }
                break;

            default:
                console.log('Unknown webhook event:', event);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}

// Health check
export async function GET() {
    return NextResponse.json({ status: 'ok', app: 'CastLaunchEarn' });
}
