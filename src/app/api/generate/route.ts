import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import type { ProjectFormData } from '@/lib/types';
import { SECTION_LABELS } from '@/lib/types';

export const runtime = 'edge';

const MODEL = 'claude-sonnet-4-6';

const MARKET_LABELS: Record<string, string> = { US: 'United States', FR: 'France', DE: 'Germany' };

function buildCombinedPrompt(data: ProjectFormData): string {
  const market = MARKET_LABELS[data.market] || data.market;
  const sections = data.sections.map((s) => SECTION_LABELS[s]).join(', ');
  const competitors = data.competitors.map((c, i) => `${i + 1}. ${c.url || 'N/A'}`).join('\n');

  return `Expert e-commerce market researcher for Meta Ads cold traffic. Generate a Saint Graal research document AND a customer avatar for this brand.

BRAND: ${data.name}
PRODUCT: ${data.product}
MARKET: ${market}
PRICE: ${data.price}
ANGLE: ${data.angle || 'TBD'}
CONTEXT: ${data.context || 'None'}
COMPETITORS: ${competitors || 'None'}
SECTIONS TO GENERATE: ${sections}

Return ONLY valid JSON with this structure:
{
  "results": {
    "sections": {
      ${data.sections.map(s => `"${s}": {"title": "${SECTION_LABELS[s]}", "content": "...", "subsections": [{"title": "...", "items": ["...", "..."]}]}`).join(',\n      ')}
    },
    "generatedAt": "${new Date().toISOString()}"
  },
  "avatar": {
    "demographics": "...",
    "psychographics": "...",
    "pain_points": ["...", "..."],
    "desires": ["...", "..."],
    "triggers": ["...", "..."],
    "objections": ["...", "..."],
    "buying_journey": "...",
    "language_patterns": ["...", "..."],
    "generatedAt": "${new Date().toISOString()}"
  }
}

Be specific, concrete, and actionable. No generic content. Write in the language of the market (French for FR, English for US/DE).`;
}

function extractJSON(text: string): { results: unknown; avatar: unknown } {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenceMatch ? fenceMatch[1].trim() : text.trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in response');
  return JSON.parse(raw.slice(start, end + 1));
}

export async function POST(req: Request) {
  try {
    const body: ProjectFormData = await req.json();
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3000,
      messages: [{ role: 'user', content: buildCombinedPrompt(body) }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = extractJSON(text);

    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
