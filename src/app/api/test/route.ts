import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function GET() {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 20,
      messages: [{ role: 'user', content: 'Reply with just: OK' }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ success: true, response: text });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
