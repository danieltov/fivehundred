import { PrismaClient } from '@prisma/client'
import * as fs from 'fs/promises'
import * as path from 'path'

const prisma = new PrismaClient()

async function validateMigration() {
  const totalAlbums = await prisma.album.count()
  const albumsWithSpotify = await prisma.album.count({
    where: { spotifyUri: { not: null } },
  })

  // Find albums missing spotifyUri
  const missing = await prisma.album.findMany({
    where: { spotifyUri: null },
    select: { id: true, title: true, slug: true },
  })
  const failures: any[] = []
  for (const album of missing) {
    try {
      // You could add more validation logic here if needed
    } catch (err) {
      failures.push({ id: album.id, title: album.title, slug: album.slug, error: String(err) })
    }
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const logsDir = path.join(process.cwd(), 'logs')
  const logFile = path.join(logsDir, `albums-missing-spotify-uri-${timestamp}.json`)
  const failFile = path.join(logsDir, `albums-missing-spotify-uri-failures-${timestamp}.json`)
  await fs.mkdir(logsDir, { recursive: true })
  if (missing.length > 0) {
    await fs.writeFile(logFile, JSON.stringify(missing, null, 2))
    console.log(`Wrote ${missing.length} albums to ${logFile}`)
  }
  if (failures.length > 0) {
    await fs.writeFile(failFile, JSON.stringify(failures, null, 2))
    console.log(`Wrote ${failures.length} failures to ${failFile}`)
  }

  console.log(`Total albums: ${totalAlbums}`)
  console.log(`Albums with Spotify URIs: ${albumsWithSpotify}`)
  console.log(`Coverage: ${((albumsWithSpotify / totalAlbums) * 100).toFixed(1)}%`)

  await prisma.$disconnect()
}

validateMigration()
