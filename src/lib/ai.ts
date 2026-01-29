// AI Service with multi-provider fallback
const AI_PROVIDERS = [
    { key: process.env.AIML_API_KEY_1, url: 'https://api.aimlapi.com/v1/chat/completions', model: 'gpt-4o-mini' },
    { key: process.env.AIML_API_KEY_2, url: 'https://openrouter.ai/api/v1/chat/completions', model: 'openai/gpt-4o-mini' },
    { key: process.env.AIML_API_KEY_3, url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.1-70b-versatile' },
];

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface CoinGenerationResult {
    name: string;
    symbol: string;
    description: string;
    imagePrompt: string;
}

// Try each AI provider in sequence until one succeeds
async function callAI(messages: AIMessage[], providerIndex: number = 0): Promise<string> {
    if (providerIndex >= AI_PROVIDERS.length) {
        throw new Error('All AI providers failed');
    }

    const provider = AI_PROVIDERS[providerIndex];
    if (!provider.key) {
        return callAI(messages, providerIndex + 1);
    }

    try {
        const response = await fetch(provider.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.key}`,
            },
            body: JSON.stringify({
                model: provider.model,
                messages,
                max_tokens: 1000,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            console.error(`Provider ${providerIndex} failed:`, await response.text());
            return callAI(messages, providerIndex + 1);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    } catch (error) {
        console.error(`Provider ${providerIndex} error:`, error);
        return callAI(messages, providerIndex + 1);
    }
}

// Generate coin details using AI
export async function generateCoinIdea(): Promise<CoinGenerationResult> {
    const systemPrompt = `You are a creative crypto coin idea generator. Generate unique, fun, and viral meme coin ideas. 
  You MUST respond in valid JSON format only, with no additional text.
  The JSON must have these exact keys: name, symbol, description, imagePrompt`;

    const userPrompt = `Generate a creative meme coin idea. Make it fun, catchy, and potentially viral.
  
  Respond ONLY with this JSON format:
  {
    "name": "Creative Coin Name",
    "symbol": "SYMBOL",
    "description": "A fun description of what this coin represents",
    "imagePrompt": "A detailed prompt for generating the coin's logo image"
  }`;

    try {
        const response = await callAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]);

        // Parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Could not parse AI response');
    } catch (error) {
        console.error('AI generation error:', error);
        // Return fallback values
        return {
            name: 'Moon Rocket',
            symbol: 'MOON',
            description: 'To the moon! 🚀',
            imagePrompt: 'A cute cartoon rocket flying to the moon with stars background'
        };
    }
}

// Chat with AI bot
export async function chatWithAI(userMessage: string, context?: string): Promise<string> {
    const systemPrompt = `You are CastBot, an AI assistant for the CastLaunchEarn platform. 
  You help users create coins, understand the platform, check their stats, and navigate features.
  You are friendly, helpful, and knowledgeable about crypto, Farcaster, and the Base blockchain.
  Keep responses concise but informative.
  ${context ? `Current context: ${context}` : ''}`;

    try {
        return await callAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ]);
    } catch (error) {
        console.error('Chat error:', error);
        return 'Sorry, I\'m having trouble responding right now. Please try again!';
    }
}

// Calculate user score
export function calculateUserScore(data: {
    coinsCreated: number;
    totalVolume: number;
    holdersCount: number;
    sharesCount: number;
    daysActive: number;
}): number {
    return (
        data.coinsCreated * 10 +
        Math.floor(data.totalVolume / 10) +
        data.holdersCount * 2 +
        data.sharesCount * 5 +
        data.daysActive
    );
}

// Generate stats summary for casting
export function generateStatsSummary(stats: {
    username: string;
    score: number;
    rank: number;
    coinsCreated: number;
    totalVolume: number;
}): string {
    return `📊 ${stats.username}'s CastLaunchEarn Stats

🏆 Rank: #${stats.rank}
⭐ Score: ${stats.score.toLocaleString()}
🪙 Coins Created: ${stats.coinsCreated}
📈 Total Volume: $${stats.totalVolume.toLocaleString()}

Created with @CastLaunchEarn 🚀`;
}
