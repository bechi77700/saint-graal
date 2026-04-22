import type { ProjectFormData, SectionKey } from './types';
import { SECTION_LABELS } from './types';

const MARKET_LABELS: Record<string, string> = { US: 'United States', FR: 'France', DE: 'Germany' };

export function buildSaintGraalPrompt(data: ProjectFormData): string {
  const marketLabel = MARKET_LABELS[data.market] || data.market;
  const selectedSections = data.sections.map((s) => SECTION_LABELS[s]).join(', ');
  const competitorList = data.competitors
    .map((c, i) => `${i + 1}. URL: ${c.url || 'N/A'} (${c.files.length} file(s) attached)`)
    .join('\n');

  return `You are an expert e-commerce market research analyst specializing in Meta Ads cold traffic strategy. Generate a comprehensive "Saint Graal" market research document for the following brand.

## BRAND BRIEF
- **Brand/Project Name**: ${data.name}
- **Product**: ${data.product}
- **Target Market**: ${marketLabel}
- **Price Point**: ${data.price}
- **Marketing Angle**: ${data.angle || 'To be determined based on research'}
- **Additional Context**: ${data.context || 'None provided'}

## COMPETITORS
${competitorList || 'No competitors specified'}

## SECTIONS TO GENERATE
${selectedSections}

---

Generate a deeply researched, actionable Saint Graal document. For each requested section, provide rich, specific, and immediately usable content. Be concrete, avoid generalities. Write in the language of the target market (French for FR, English for US/DE).

Return your response as a valid JSON object with this exact structure:
{
  "sections": {
    ${data.sections.map((s) => `"${s}": { "title": "${SECTION_LABELS[s]}", "content": "...", "subsections": [{ "title": "...", "items": ["...", "..."] }] }`).join(',\n    ')}
  },
  "generatedAt": "${new Date().toISOString()}"
}

### SECTION GUIDELINES:

**angles_marketing** (if requested):
- List 5-10 distinct marketing angles for cold traffic Meta Ads
- Each angle: name, core emotional hook, target sub-audience, ad copy direction
- Focus on what makes people stop scrolling

**verbatims_reddit** (if requested):
- 15-25 authentic verbatim-style quotes that real customers would write
- Mix of: pre-purchase questions, post-purchase reviews, pain point descriptions
- Include the specific language, slang, and expressions real people use
- Organize by: Pain Points, Desires, Results, Comparisons

**champ_lexical** (if requested):
- 50+ specific words and expressions used by the target audience
- Categories: Problem vocabulary, Aspiration vocabulary, Product vocabulary, Emotion vocabulary
- Power words for ad copy

**objections** (if requested):
- 10-15 specific objections cold traffic prospects have
- For each: the objection, the underlying fear, the ideal reframe/counter

**analyse_concurrents** (if requested):
- Analysis of competitor positioning, messaging, offers, pricing
- Their strengths, weaknesses, and gaps to exploit
- Differentiation opportunities

**benefices_features** (if requested):
- Complete benefits/features matrix
- Features → Advantages → Benefits (FAB framework)
- Emotional vs rational benefits
- Unique selling points

**niveaux_conscience** (if requested):
- Audience segmented by Eugene Schwartz's 5 levels of awareness
- For each level: audience description, what they know/feel, message to use, ad type/format to use
- Cold traffic Meta Ads focus

Make every section deeply specific to "${data.product}" for the "${marketLabel}" market at "${data.price}" price point. This should feel like expert consulting, not generic advice.`;
}

export function buildAvatarPrompt(data: ProjectFormData): string {
  const marketLabel = MARKET_LABELS[data.market] || data.market;

  return `You are an expert customer avatar researcher for e-commerce brands running Meta Ads. Create a hyper-detailed customer avatar document for this brand.

## BRAND BRIEF
- **Brand/Project Name**: ${data.name}
- **Product**: ${data.product}
- **Target Market**: ${marketLabel}
- **Price Point**: ${data.price}
- **Marketing Angle**: ${data.angle || 'To be determined'}
- **Additional Context**: ${data.context || 'None provided'}

Generate a comprehensive customer avatar. Return as valid JSON:
{
  "demographics": "Detailed demographic profile (age, gender split %, location, income, education, job)",
  "psychographics": "Deep psychographic profile: values, beliefs, lifestyle, personality traits, self-image, aspirations",
  "pain_points": ["Specific pain point 1", "Specific pain point 2", "...at least 8 pain points"],
  "desires": ["Deep desire 1", "Deep desire 2", "...at least 8 desires"],
  "triggers": ["Buying trigger 1", "What makes them finally buy", "...at least 6 triggers"],
  "objections": ["Objection before buying 1", "...at least 6 objections"],
  "buying_journey": "Narrative of their typical journey from problem awareness to purchase decision",
  "language_patterns": ["Phrase they use 1", "How they describe their problem", "...at least 10 specific phrases"],
  "generatedAt": "${new Date().toISOString()}"
}

Make the avatar hyper-specific to someone who would buy "${data.product}" at "${data.price}" in the "${marketLabel}" market via Meta Ads cold traffic. Name the avatar, give them a life story. Make it feel like a real person.`;
}
