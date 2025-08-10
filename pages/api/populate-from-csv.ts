import { NextApiRequest, NextApiResponse } from 'next'

import { closePrismaConnection, importAllMusicCSV } from '../../lib/csv-importer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Starting AllMusic CSV import...')

    const { results, summary } = await importAllMusicCSV()

    return res.status(200).json({
      success: true,
      message: `Import completed: ${summary.successful} successful, ${summary.skipped} skipped, ${summary.failed} failed`,
      results,
      summary,
    })
  } catch (error) {
    console.error('Import error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack,
    })
  } finally {
    // Clean up Prisma connection
    await closePrismaConnection()
  }
}
