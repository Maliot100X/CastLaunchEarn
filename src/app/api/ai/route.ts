import { NextRequest, NextResponse } from 'next/server';
import { generateCoinIdea, chatWithAI } from '@/lib/ai';

// Generate coin idea or chat with AI
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, message, context } = body;

        if (action === 'generate') {
            // Generate a new coin idea
            try {
                const idea = await generateCoinIdea();

                // Generate image URL using Pollinations AI (reliable, free, high quality)
                // We use the generated image prompt to create a visual
                const encodedPrompt = encodeURIComponent(idea.imagePrompt || `Logo for crypto coin ${idea.name} ${idea.symbol}`);
                const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

                return NextResponse.json({
                    idea: {
                        ...idea,
                        imageUrl
                    }
                });
            } catch (err) {
                console.error('Generation logic error:', err);
                return NextResponse.json({ error: 'Failed to generate idea' }, { status: 500 });
            }
        }

        if (action === 'chat') {
            if (!message) {
                return NextResponse.json({ error: 'Message required' }, { status: 400 });
            }
            try {
                const response = await chatWithAI(message, context);
                return NextResponse.json({ response });
            } catch (err: any) {
                console.error('Chat logic error detail:', err.message);
                console.error('Stack:', err.stack);
                return NextResponse.json({
                    response: "Sorry, I'm having trouble connecting to my brain. Please check Vercel logs for API key status."
                });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('AI API error:', error);
        return NextResponse.json({ error: 'AI service failed' }, { status: 500 });
    }
}
