import * as fs from 'fs/promises'
import * as path from 'path'

import { getCoverArtFromMBID } from '../lib/musicbrainz'
import prisma from '../lib/prisma'

async function findAndUpdateMissingCoverArt() {
  const failed: Array<{ id: string; title: string; artist: string[]; reason: string }> = []
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const logsDir = path.join(process.cwd(), 'logs')
  const logFile = path.join(logsDir, `missing-cover-art-${timestamp}.json`)
  try {
    await fs.mkdir(logsDir, { recursive: true })
    console.log('🔍 Searching for albums missing cover art...')
    const albums = await prisma.album.findMany({
      where: { OR: [{ coverArt: undefined }, { coverArt: '' }, { coverArt: '/no-cover.png' }] },
      include: { artist: true },
    })
    console.log(`Found ${albums.length} albums without cover art.`)

    for (let i = 0; i < albums.length; i++) {
      const album = albums[i]
      const artistNames = album.artist.map((a) => a.name)
      console.log(`[${i + 1}/${albums.length}] Trying: ${artistNames.join(', ')} - ${album.title}`)
      let mbid: string | null = null
      try {
        const { searchMusicBrainzReleaseGroup } = await import('../lib/musicbrainz')
        mbid = await searchMusicBrainzReleaseGroup(artistNames[0], album.title)
      } catch (e) {
        failed.push({
          id: album.id,
          title: album.title,
          artist: artistNames,
          reason: 'MBID lookup error',
        })
        console.log('  ❌ MBID lookup error')
        continue
      }
      if (!mbid) {
        failed.push({
          id: album.id,
          title: album.title,
          artist: artistNames,
          reason: 'No MBID found',
        })
        console.log('  ❌ No MBID found')
        continue
      }
      let coverArt: string | null = null
      try {
        coverArt = await getCoverArtFromMBID(mbid)
      } catch (e) {
        failed.push({
          id: album.id,
          title: album.title,
          artist: artistNames,
          reason: 'Cover art lookup error',
        })
        console.log('  ❌ Cover art lookup error')
        continue
      }
      if (coverArt) {
        try {
          await prisma.album.update({ where: { id: album.id }, data: { coverArt } })
          console.log('  ✅ Cover art found and updated')
        } catch (e) {
          failed.push({
            id: album.id,
            title: album.title,
            artist: artistNames,
            reason: 'DB update error',
          })
          console.log('  ❌ DB update error')
        }
      } else {
        failed.push({
          id: album.id,
          title: album.title,
          artist: artistNames,
          reason: 'No cover art found',
        })
        console.log('  ❌ No cover art found')
      }
      // Be nice to APIs
      await new Promise((r) => setTimeout(r, 1000))
    }
    if (failed.length > 0) {
      await fs.writeFile(logFile, JSON.stringify(failed, null, 2))
      console.log(`❗️ ${failed.length} albums still missing cover art. See ${logFile}`)
    } else {
      console.log('🎉 All albums have cover art!')
    }
  } catch (error) {
    const errorLogFile = path.join(logsDir, `missing-cover-art-error-${timestamp}.json`)
    await fs.writeFile(errorLogFile, JSON.stringify({ error: String(error) }, null, 2))
    console.error('Script error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findAndUpdateMissingCoverArt()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Script failed:', err)
    process.exit(1)
  })
