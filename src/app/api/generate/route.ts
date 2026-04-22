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
        blocks.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: file.base64 },
        } as Anthropic.DocumentBlockParam);
      } else if (file.type.startsWith('image/')) {
        blocks.push({
          type: 'image',
          source: { type: 'base64', media_type: file.type as ImageMediaType, data: file.base64 },
        } as Anthropic.ImageBlockParam);
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

    const saintGraalPrompt = buildSaintGraalPrompt(body);
    const avatarPrompt = buildAvatarPrompt(body);

    const saintGraalContent = buildContentBlocks(saintGraalPrompt, body.competitors);
    const avatarContent = buildContentBlocks(avatarPrompt, body.competitors);

    const [saintGraalResponse, avatarResponse] = await Promise.all([
      anthropic.messages.create({
        model: MODEL,
        max_tokens: 8000,
        messages: [{ role: 'user', content: saintGraalContent }],
      }),
      anthropic.messages.create({
        model: MODEL,
        max_tokens: 4000,
        messages: [{ role: 'user', content: avatarContent }],
      }),
    ]);

    const saintGraalText =
      saintGraalResponse.content[0].type === 'text' ? saintGraalResponse.content[0].text : '';
    const avatarText =
      avatarResponse.content[0].type === 'text' ? avatarResponse.content[0].text : '';

    const results = extractJSON(saintGraalText);
    const avatar = extractJSON(avatarText);

    return NextResponse.json({ results, avatar });
  } catch (error) {
    console.error('POST /api/generate error:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 120;

