/**
 * Generate Groups V2 - Server-side Claude integration
 *
 * Shared logic for generating connection groups using Claude.
 * Supports multiple genres (films, music, books, sports).
 * Used by both Vite dev server and Vercel API route.
 */

import Anthropic from '@anthropic-ai/sdk'
import type {
  GenerationFilters,
  ConnectionType,
  FeedbackRecord,
  GeneratedGroup,
  VerifiedItem,
} from './types'
import { getDomainConfig, type DomainConfig } from './domainConfig'

interface AIItemResponse {
  title: string
  year?: number
}

interface AIGroupResponse {
  items: AIItemResponse[]
  connection: string
  connectionType: string
  explanation: string
}

interface AIResponse {
  groups: AIGroupResponse[]
}

export interface GenerateGroupsV2Result {
  groups: GeneratedGroup[]
  tokensUsed: {
    input: number | undefined
    output: number | undefined
  }
}

export async function generateGroupsV2(
  apiKey: string,
  filters: GenerationFilters,
  connectionTypes: ConnectionType[],
  count: number,
  goodExamples: FeedbackRecord[],
  badExamples: FeedbackRecord[]
): Promise<GenerateGroupsV2Result> {
  const genre = filters.genre || 'films'
  const domainConfig = getDomainConfig(genre)
  const prompt = buildPrompt(domainConfig, filters, connectionTypes, count, goodExamples, badExamples)

  const client = new Anthropic({ apiKey })
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  })

  const textContent = response.content.find((c) => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in AI response')
  }

  const aiResponse = parseResponse(textContent.text)
  const groups = mapToGeneratedGroups(aiResponse)

  return {
    groups,
    tokensUsed: {
      input: response.usage?.input_tokens,
      output: response.usage?.output_tokens,
    },
  }
}

function buildPrompt(
  config: DomainConfig,
  filters: GenerationFilters,
  connectionTypes: ConnectionType[],
  count: number,
  goodExamples: FeedbackRecord[],
  badExamples: FeedbackRecord[]
): string {
  const parts: string[] = []
  const { expertRole, itemName, itemNamePlural, yearLabel } = config

  // System context - dynamically uses domain terminology
  let requirements = `You are a ${expertRole} creating groups of 4 ${itemNamePlural} for a puzzle game similar to NYT Connections.
Each group should have exactly 4 ${itemNamePlural} that share a clever, interesting connection.

IMPORTANT REQUIREMENTS:
- Each group must have exactly 4 ${itemNamePlural}
- All ${itemNamePlural} must be real and well-known
- Connections should be creative, surprising, and satisfying to discover
- Avoid obvious or boring connections
- Each ${itemName} should clearly fit the connection${yearLabel ? `\n- Provide the ${yearLabel} for each ${itemName}` : ''}`

  // Add genre-specific format instruction if present
  if (config.formatInstruction) {
    requirements += `\n- ${config.formatInstruction}`
  }

  parts.push(requirements)

  // Connection types - instruct Claude to ONLY use these
  if (connectionTypes.length > 0) {
    parts.push('\n\nCONNECTION TYPES TO USE:')
    parts.push('IMPORTANT: You MUST use ONLY these connection types. Each group\'s connectionType field MUST exactly match one of these names.')
    connectionTypes.forEach((ct) => {
      let typeDescription = `- ${ct.name} (${ct.category}): ${ct.description}`
      if (ct.examples && ct.examples.length > 0) {
        typeDescription += ` Examples: ${ct.examples.join(', ')}`
      }
      parts.push(typeDescription)
    })
    const typeNames = connectionTypes.map((ct) => ct.name).join(', ')
    parts.push(`\nValid connectionType values: ${typeNames}`)
  }

  // Filters
  if (filters.targetDifficulty) {
    const difficultyDescriptions: Record<string, string> = {
      easy: `EASY difficulty - connections should be straightforward and obvious once revealed. Use common, well-known ${itemNamePlural} that most people would recognize. The connection should be satisfying but not require deep knowledge.`,
      medium: `MEDIUM difficulty - connections should require some thought but be gettable. Use a mix of popular and slightly less mainstream ${itemNamePlural}. The connection might have a small twist or wordplay.`,
      hard: `HARD difficulty - connections should be clever and require careful thinking. Can use more obscure ${itemNamePlural} or have non-obvious connections. Wordplay, puns, or lateral thinking encouraged.`,
      expert: `EXPERT difficulty - connections should be very tricky and satisfying to solve. Use obscure knowledge, complex wordplay, or connections that require expertise. These should stump most players initially.`,
    };
    parts.push(`\n\nDIFFICULTY LEVEL: ${difficultyDescriptions[filters.targetDifficulty]}`);
  }

  if (filters.yearRange) {
    parts.push(
      `\n\nYEAR RANGE: Only use ${itemNamePlural} from between ${filters.yearRange[0]} and ${filters.yearRange[1]}.`
    )
  }

  if (filters.excludeConnections && filters.excludeConnections.length > 0) {
    parts.push('\n\nEXCLUDE THESE CONNECTIONS (already used):')
    filters.excludeConnections.forEach((c) => parts.push(`- ${c}`))
  }

  // Good examples
  if (goodExamples && goodExamples.length > 0) {
    parts.push('\n\nGOOD EXAMPLES (generate similar quality):')
    goodExamples.forEach((ex) => {
      const itemsList = ex.items.map((item) => yearLabel ? `${item.title} (${item.year})` : item.title).join(', ')
      parts.push(`- Connection: "${ex.connection}"`)
      parts.push(`  ${itemNamePlural}: ${itemsList}`)
    })
  }

  // Bad examples
  if (badExamples && badExamples.length > 0) {
    parts.push('\n\nBAD EXAMPLES (avoid these patterns):')
    badExamples.forEach((ex) => {
      const itemsList = ex.items.map((item) => yearLabel ? `${item.title} (${item.year})` : item.title).join(', ')
      parts.push(`- Connection: "${ex.connection}"`)
      parts.push(`  ${itemNamePlural}: ${itemsList}`)
      if (ex.rejectionReason) {
        parts.push(`  Why bad: ${ex.rejectionReason}`)
      }
    })
  }

  // Request format
  const connectionInstruction = connectionTypes.length > 0
    ? `using ONLY the connection types listed above (distribute evenly across the provided types)`
    : `with diverse connection types`
  const itemExample = yearLabel
    ? `{"title": "${itemName.charAt(0).toUpperCase() + itemName.slice(1)} Title", "year": 2020}`
    : `{"title": "${itemName.charAt(0).toUpperCase() + itemName.slice(1)} Title"}`
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
}`)

  return parts.join('\n')
}

function parseResponse(text: string): AIResponse {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in AI response')
  }
  return JSON.parse(jsonMatch[0])
}

function mapToGeneratedGroups(response: AIResponse): GeneratedGroup[] {
  return response.groups.map((group) => ({
    id: globalThis.crypto.randomUUID(),
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
  }))
}

/**
 * Browser-safe version that calls the API endpoint instead of using Anthropic SDK directly.
 * Use this in frontend code (React components, hooks).
 */
export async function generateGroupsV2Browser(
  _apiKey: string, // Not used - API key is server-side only
  filters: GenerationFilters,
  connectionTypes: ConnectionType[],
  count: number,
  goodExamples: FeedbackRecord[],
  badExamples: FeedbackRecord[]
): Promise<GenerateGroupsV2Result> {
  const response = await fetch('/api/generate-groups-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filters,
      connectionTypes,
      goodExamples,
      badExamples,
      count,
    }),
  })

  if (!response.ok) {
    // Try to parse JSON error, fall back to text
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to generate groups')
    } else {
      const errorText = await response.text()
      throw new Error(errorText || 'Failed to generate groups')
    }
  }

  const data = await response.json()

  return {
    groups: data.groups,
    tokensUsed: {
      input: data.tokensUsed?.input,
      output: data.tokensUsed?.output,
    },
  }
}
