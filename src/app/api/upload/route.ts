import { NextRequest, NextResponse } from 'next/server';

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_URL = 'https://api.pinata.cloud';

export async function POST(request: NextRequest) {
    try {
        if (!PINATA_JWT) {
            return NextResponse.json({ error: 'Pinata not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { type, data } = body;

        if (type === 'metadata') {
            // Upload JSON metadata
            const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PINATA_JWT}`,
                },
                body: JSON.stringify({
                    pinataContent: data,
                    pinataMetadata: { name: `${data.name} metadata` },
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                return NextResponse.json({ error: `Upload failed: ${error}` }, { status: 500 });
            }

            const result = await response.json();
            return NextResponse.json({ uri: `ipfs://${result.IpfsHash}` });
        }

        return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
