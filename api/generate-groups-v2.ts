/**
 * Vercel API Route: Generate Groups with Claude AI (v2)
 *
 * Self-contained version for Vercel serverless deployment.
 * Generates connection groups using Claude AI.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

// Types
type Genre = 'films' | 'music' | 'books' | 'sports';

interface GenerationFilters {
  genre?: Genre;
  excludeConnections?: string[];
  targetDifficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  yearRange?: [number, number];
}

interface ConnectionType {
  id: string;
  name: string;
  category: string;
  description: string;
  examples?: string[];
  genre?: Genre;
}

interface FeedbackItem {
  title: string;
  year?: number;
}

interface FeedbackRecord {
  items: FeedbackItem[];
  connection: string;
  rejectionReason?: string;
}

interface VerifiedItem {
  title: string;
  year?: number;
  externalId: number | string | null;
  verified: boolean;
}

interface GeneratedGroup {
  id: string;
  items: VerifiedItem[];
  connection: string;
  connectionType: string;
  explanation: string;
  allItemsVerified: boolean;
}

interface AIItemResponse {
  title: string;
  year?: number;
}

interface AIGroupResponse {
  items: AIItemResponse[];
  connection: string;
  connectionType: string;
  explanation: string;
}

interface AIResponse {
  groups: AIGroupResponse[];
}

interface DomainConfig {
  genre: Genre;
  expertRole: string;
  itemName: string;
  itemNamePlural: string;
  yearLabel: string;
}

interface RequestBody {
  filters: GenerationFilters;
  connectionTypes: ConnectionType[];
  goodExamples: FeedbackRecord[];
  badExamples: FeedbackRecord[];
  count: number;
}

// Domain configurations
const DOMAIN_CONFIGS: Record<Genre, DomainConfig> = {
  films: {
    genre: 'films',
    expertRole: 'film expert with deep knowledge of cinema history',
    itemName: 'film',
    itemNamePlural: 'films',
    yearLabel: 'release year',
  },
  music: {
    genre: 'music',
    expertRole: 'music expert with deep knowledge of music history across all genres',
    itemName: 'song',
    itemNamePlural: 'songs',
    yearLabel: '',
  },
  books: {
    genre: 'books',
    expertRole: 'literary expert with deep knowledge of books and authors',
    itemName: 'book',
    itemNamePlural: 'books',
    yearLabel: 'publication year',
  },
  sports: {
    genre: 'sports',
    expertRole: 'sports expert with deep knowledge of athletes and sporting events',
    itemName: 'athlete/team',
    itemNamePlural: 'athletes/teams',
    yearLabel: 'year active',
  },
};

function getDomainConfig(genre: Genre): DomainConfig {
  return DOMAIN_CONFIGS[genre];
}

function buildPrompt(
  config: DomainConfig,
  filters: GenerationFilters,
  connectionTypes: ConnectionType[],
  count: number,
  goodExamples: FeedbackRecord[],
  badExamples: FeedbackRecord[]
): string {
  const parts: string[] = [];
  const { expertRole, itemName, itemNamePlural, yearLabel } = config;

  // System context
  let requirements = `You are a ${expertRole} creating groups of 4 ${itemNamePlural} for a puzzle game similar to NYT Connections.
Each group should have exactly 4 ${itemNamePlural} that share a clever, interesting connection.

IMPORTANT REQUIREMENTS:
- Each group must have exactly 4 ${itemNamePlural}
- All ${itemNamePlural} must be real and well-known
- Connections should be creative, surprising, and satisfying to discover
- Avoid obvious or boring connections
- Each ${itemName} should clearly fit the connection${yearLabel ? `\n- Provide the ${yearLabel} for each ${itemName}` : ''}`;

  parts.push(requirements);

  // Connection types
  if (connectionTypes.length > 0) {
    parts.push('\n\nCONNECTION TYPES TO USE:');
    parts.push('IMPORTANT: You MUST use ONLY these connection types. Each group\'s connectionType field MUST exactly match one of these names.');
    connectionTypes.forEach((ct) => {
      let typeDescription = `- ${ct.name} (${ct.category}): ${ct.description}`;
      if (ct.examples && ct.examples.length > 0) {
        typeDescription += ` Examples: ${ct.examples.join(', ')}`;
      }
      parts.push(typeDescription);
    });
    const typeNames = connectionTypes.map((ct) => ct.name).join(', ');
    parts.push(`\nValid connectionType values: ${typeNames}`);
  }

  // Difficulty
  if (filters.targetDifficulty) {
    const difficultyDescriptions: Record<string, string> = {
      easy: `EASY difficulty - connections should be straightforward and obvious once revealed. Use common, well-known ${itemNamePlural} that most people would recognize.`,
      medium: `MEDIUM difficulty - connections should require some thought but be gettable. Use a mix of popular and slightly less mainstream ${itemNamePlural}.`,
      hard: `HARD difficulty - connections should be clever and require careful thinking. Can use more obscure ${itemNamePlural} or have non-obvious connections.`,
      expert: `EXPERT difficulty - connections should be very tricky and satisfying to solve. Use obscure knowledge, complex wordplay, or connections that require expertise.`,
    };
    parts.push(`\n\nDIFFICULTY LEVEL: ${difficultyDescriptions[filters.targetDifficulty]}`);
  }

  if (filters.yearRange) {
    parts.push(
      `\n\nYEAR RANGE: Only use ${itemNamePlural} from between ${filters.yearRange[0]} and ${filters.yearRange[1]}.`
    );
  }

  if (filters.excludeConnections && filters.excludeConnections.length > 0) {
    parts.push('\n\nEXCLUDE THESE CONNECTIONS (already used):');
    filters.excludeConnections.slice(-100).forEach((c) => parts.push(`- ${c}`));
  }

  // Good examples
  if (goodExamples && goodExamples.length > 0) {
    parts.push('\n\nGOOD EXAMPLES (generate similar quality):');
    goodExamples.forEach((ex) => {
      const itemsList = ex.items.map((item) => yearLabel ? `${item.title} (${item.year})` : item.title).join(', ');
      parts.push(`- Connection: "${ex.connection}"`);
      parts.push(`  ${itemNamePlural}: ${itemsList}`);
    });
  }

  // Bad examples
  if (badExamples && badExamples.length > 0) {
    parts.push('\n\nBAD EXAMPLES (avoid these patterns):');
    badExamples.forEach((ex) => {
      const itemsList = ex.items.map((item) => yearLabel ? `${item.title} (${item.year})` : item.title).join(', ');
      parts.push(`- Connection: "${ex.connection}"`);
      parts.push(`  ${itemNamePlural}: ${itemsList}`);
      if (ex.rejectionReason) {
        parts.push(`  Why bad: ${ex.rejectionReason}`);
      }
    });
  }

  // Request format
  const connectionInstruction = connectionTypes.length > 0
    ? `using ONLY the connection types listed above (distribute evenly across the provided types)`
    : `with diverse connection types`;
  const itemExample = yearLabel
    ? `{"title": "${itemName.charAt(0).toUpperCase() + itemName.slice(1)} Title", "year": 2020}`
    : `{"title": "${itemName.charAt(0).toUpperCase() + itemName.slice(1)} Title"}`;
  parts.push(`\n\nGenerate ${count} ${itemName} groups ${connectionInstruction}.

Respond with valid JSON only, no other text:
{
  "groups": [
    {
      "items": [
        ${itemExample},
        ${itemExample},
        ${itemExample},
        ${itemExample}
      ],
      "connection": "The connection description",
      "connectionType": "category-name",
      "explanation": "Why these ${itemNamePlural} fit the connection"
    }
  ]
}`);

  return parts.join('\n');
}

function parseResponse(text: string): AIResponse {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in AI response');
  }
  return JSON.parse(jsonMatch[0]);
}

function mapToGeneratedGroups(response: AIResponse): GeneratedGroup[] {
  return response.groups.map((group, index) => ({
    id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    items: group.items.map(
      (item): VerifiedItem => ({
        title: item.title,
        year: item.year,
        externalId: null,
        verified: false,
      })
    ),
    connection: group.connection,
    connectionType: group.connectionType,
    explanation: group.explanation,
    allItemsVerified: false,
  }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { filters, connectionTypes, goodExamples, badExamples, count } =
      req.body as RequestBody;

    if (!connectionTypes || connectionTypes.length === 0) {
      return res.status(400).json({ error: 'At least one connection type required' });
    }

    if (!count || count < 1 || count > 30) {
      return res.status(400).json({ error: 'Count must be between 1 and 30' });
    }

    const genre = filters.genre || 'films';
    const domainConfig = getDomainConfig(genre);
    const prompt = buildPrompt(domainConfig, filters, connectionTypes, count, goodExamples, badExamples);

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in AI response');
    }

    const aiResponse = parseResponse(textContent.text);
    const groups = mapToGeneratedGroups(aiResponse);

    return res.status(200).json({
      groups,
      tokensUsed: {
        input: response.usage?.input_tokens,
        output: response.usage?.output_tokens,
      },
    });
  } catch (error) {
    console.error('Error generating groups:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate groups',
    });
  }
}
