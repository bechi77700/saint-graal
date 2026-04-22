import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildSaintGraalPrompt, buildAvatarPrompt } from '@/lib/prompts';
import type { ProjectFormData, Competitor } from '@/lib/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
type ContentBlock = Anthropic.TextBlockParam | Anthropic.ImageBlockParam | Anthropic.DocumentBlockParam;

function buildContentBlocks(text: string, competitors: Competitor[]): ContentBlock[] {
  const blocks: ContentBlock[] = [{ type: 'text', text }];
  for (const competitor of competitors) {
    for (const file of competitor.files) {
      if (file.type === 'application/pdf') {
        blocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: file.base64 } } as Anthropic.DocumentBlockParam);
      } else if (file.type.startsWith('image/')) {
        blocks.push({ type: 'image', source: { type: 'base64', media_type: file.type as ImageMediaType, data: file.base64 } } as Anthropic.ImageBlockParam);
      }
    }
  }
  return blocks;
}

function extractJSON(text: string): unknown {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenceMatch ? fenceMatch[1].trim() : text.trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  return JSON.parse(raw.slice(start, end + 1));
}

export async function POST(req: Request) {
  try {
    const body: ProjectFormData = await req.json();

    const [saintGraalRes, avatarRes] = await Promise.all([
      anthropic.messages.create({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: 'user', content: buildContentBlocks(buildSaintGraalPrompt(body), body.competitors) }],
      }),
      anthropic.messages.create({
        model: MODEL,
        max_tokens: 1000,
        messages: [{ role: 'user', content: buildContentBlocks(buildAvatarPrompt(body), body.competitors) }],
      }),
    ]);

    const saintGraalText = saintGraalRes.content[0].type === 'text' ? saintGraalRes.content[0].text : '';
    const avatarText = avatarRes.content[0].type === 'text' ? avatarRes.content[0].text : '';

    return NextResponse.json({
      results: extractJSON(saintGraalText),
      avatar: extractJSON(avatarText),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 60;
