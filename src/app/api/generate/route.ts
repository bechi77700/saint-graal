import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import type { ProjectFormData } from '@/lib/types';
import { SECTION_LABELS } from '@/lib/types';

export const maxDuration = 60;

const MODEL = 'claude-sonnet-4-6';
const MARKET_LABELS: Record<string, string> = { US: 'United States', FR: 'France', DE: 'Germany' };

function buildPrompt(data: ProjectFormData): string {
  const market = MARKET_LABELS[data.market] || data.market;
  const sections = data.sections.map((s) => SECTION_LABELS[s]).join(', ');

  return `You are an expert e-commerce market researcher. Generate a Saint Graal research doc + customer avatar.

BRAND: ${data.name} | PRODUCT: ${data.product} | MARKET: ${market} | PRICE: ${data.price}
ANGLE: ${data.angle || 'TBD'} | CONTEXT: ${data.context || 'None'}
SECTIONS: ${sections}

Return ONLY this JSON (no markdown, no explanation):
{"results":{"sections":{${data.sections.map(s => `"${s}":{"title":"${SECTION_LABELS[s]}","content":"...","subsections":[{"title":"...","items":["...","..."]}]}`).join(',')}},"generatedAt":"${new Date().toISOString()}"},"avatar":{"demographics":"...","psychographics":"...","pain_points":["...","...","..."],"desires":["...","...","..."],"triggers":["...","..."],"objections":["...","..."],"buying_journey":"...","language_patterns":["...","...","..."],"generatedAt":"${new Date().toISOString()}"}}

Be specific and concrete for ${data.product} in ${market} at ${data.price}.`;
}

function extractJSON(text: string): { results: unknown; avatar: unknown } {
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error(`No JSON found. Response was: ${clean.slice(0, 200)}`);
  return JSON.parse(clean.slice(start, end + 1));
}

export async function POST(req: Request) {
  try {
    const body: ProjectFormData = await req.json();
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: buildPrompt(body) }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = extractJSON(text);
    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Generate error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
