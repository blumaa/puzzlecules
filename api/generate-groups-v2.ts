/**
 * Vercel API Route: Generate Groups with Claude AI (v2)
 *
 * Uses shared generateGroupsV2 logic for consistency with dev server.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateGroupsV2 } from '../src/services/group-generator/generateGroupsV2'
import type {
  GenerationFilters,
  ConnectionType,
  FeedbackRecord,
} from '../src/services/group-generator/types'

interface RequestBody {
  filters: GenerationFilters
  connectionTypes: ConnectionType[]
  goodExamples: FeedbackRecord[]
  badExamples: FeedbackRecord[]
  count: number
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not configured')
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const { filters, connectionTypes, goodExamples, badExamples, count } =
      req.body as RequestBody

    if (!connectionTypes || connectionTypes.length === 0) {
      return res.status(400).json({ error: 'At least one connection type required' })
    }

    if (!count || count < 1 || count > 30) {
      return res.status(400).json({ error: 'Count must be between 1 and 30' })
    }

    const result = await generateGroupsV2(
      apiKey,
      filters,
      connectionTypes,
      count,
      goodExamples,
      badExamples
    )

    return res.status(200).json(result)
  } catch (error) {
    console.error('Error generating groups:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate groups',
    })
  }
}
