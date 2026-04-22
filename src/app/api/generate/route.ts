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

async function callClaude(content: ContentBlock[], maxTokens: number): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  const body: ProjectFormData = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const heartbeat = setInterval(() => {
        try { send({ status: 'heartbeat' }); } catch {}
      }, 5000);

      try {
        send({ status: 'generating', message: 'Génération en cours…' });

        const [saintGraalText, avatarText] = await Promise.all([
          callClaude(buildContentBlocks(buildSaintGraalPrompt(body), body.competitors), 2500),
          callClaude(buildContentBlocks(buildAvatarPrompt(body), body.competitors), 1200),
        ]);

        send({ status: 'done', results: extractJSON(saintGraalText), avatar: extractJSON(avatarText) });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        send({ status: 'error', error: msg });
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export const maxDuration = 60;
