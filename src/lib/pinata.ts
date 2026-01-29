// Pinata IPFS upload service - CLIENT SIDE
// Uses API route for server-side Pinata JWT access

export interface PinataUploadResult {
    uri: string;
}

// Upload file to IPFS via Pinata (via API route)
export async function uploadFileToPinata(file: File): Promise<string> {
    // Convert file to base64 for API route
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'file',
            filename: file.name,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }

    const result: PinataUploadResult = await response.json();
    return result.uri;
}

// Upload JSON metadata to IPFS
export async function uploadMetadataToPinata(metadata: {
    name: string;
    description: string;
    image: string;
    attributes?: Array<{ trait_type: string; value: string }>;
}): Promise<string> {
    const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'metadata',
            data: metadata,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Metadata upload failed');
    }

    const result: PinataUploadResult = await response.json();
    return result.uri;
}

// Create coin metadata and upload to IPFS
export async function createCoinMetadata(data: {
    name: string;
    symbol: string;
    description: string;
    imageFile?: File;
    imageUrl?: string;
}): Promise<string> {
    let imageUri = data.imageUrl || '';

    // For now, skip file upload if no external image provided
    // User can provide image URL or we use a default
    if (!imageUri && !data.imageFile) {
        imageUri = 'ipfs://bafkreidgfsdjx4nt4vctch73xqbf3itfie4q3xeg3jj3kd4s5r6x7lby34'; // Default coin image
    }

    const metadata = {
        name: data.name,
        description: data.description || `${data.name} - Created on CastLaunchEarn`,
        image: imageUri,
        attributes: [
            { trait_type: 'Symbol', value: data.symbol },
            { trait_type: 'Platform', value: 'CastLaunchEarn' },
            { trait_type: 'Created', value: new Date().toISOString() },
        ],
    };

    return await uploadMetadataToPinata(metadata);
}
