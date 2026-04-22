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

async function streamCompletion(content: ContentBlock[], maxTokens: number): Promise<string> {
  let text = '';
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content }],
  });
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      text += event.delta.text;
    }
  }
  return text;
}

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const send = async (data: object) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  (async () => {
    try {
      const body: ProjectFormData = await req.json();

      await send({ status: 'generating', message: 'Génération en cours…' });

      const [saintGraalText, avatarText] = await Promise.all([
        streamCompletion(buildContentBlocks(buildSaintGraalPrompt(body), body.competitors), 6000),
        streamCompletion(buildContentBlocks(buildAvatarPrompt(body), body.competitors), 3000),
      ]);

      const results = extractJSON(saintGraalText);
      const avatar = extractJSON(avatarText);

      await send({ status: 'done', results, avatar });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      await send({ status: 'error', error: message });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export const maxDuration = 120;
