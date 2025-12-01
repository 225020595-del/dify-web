import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const apiKey = process.env.NEXT_PUBLIC_APP_KEY
  
  res.status(200).json({
    hasApiUrl: !!apiUrl,
    hasApiKey: !!apiKey,
    apiUrl: apiUrl || 'NOT SET',
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET',
  })
}
