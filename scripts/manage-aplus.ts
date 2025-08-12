/* eslint-disable no-console */
import { promises as fs } from 'fs'

import prisma from '../lib/prisma'

// Types
interface ProcessingStats {
  total: number
  updated: number
  failed: number
  notFound: number
}

interface AlbumWithArtist {
  id: string
  title: string
  isAPlus: boolean
  artist: { name: string }[]
}

interface UpdateResult {
  albumId: string
  title: string
  artist: string
  searchTerm: string
  isExactMatch: boolean
  alternativesFound: number
  wasAlreadyInDesiredState: boolean
  timestamp: string
}

interface LogEntry {
  title: string
  reason: string
  timestamp: string
}

type OperationType = 'add' | 'remove'

// Utility functions
const createTimestamp = (): string => new Date().toISOString().replace(/[:.]/g, '-')

const getArtistName = (album: AlbumWithArtist): string => album.artist[0]?.name || 'Unknown Artist'

const setupLogging = async (
  operation: OperationType
): Promise<{
  logsDir: string
  logFile: string
  failLogFile: string
  notFoundLogFile: string
}> => {
  const timestamp = createTimestamp()
  const logsDir = `${process.cwd()}/logs`

  await fs.mkdir(logsDir, { recursive: true })

  return {
    logsDir,
    logFile: `${logsDir}/aplus-${operation}-${timestamp}.json`,
    failLogFile: `${logsDir}/aplus-${operation}-failures-${timestamp}.json`,
    notFoundLogFile: `${logsDir}/aplus-${operation}-not-found-${timestamp}.json`,
  }
}

const findAlbumByTitle = async (albumTitle: string): Promise<AlbumWithArtist[]> => {
  return prisma.album.findMany({
    where: {
      title: {
        contains: albumTitle,
        mode: 'insensitive',
      },
    },
    include: {
      artist: { select: { name: true } },
    },
  })
}

const selectBestMatch = (albums: AlbumWithArtist[], searchTerm: string): AlbumWithArtist => {
  if (albums.length === 1) {
    return albums[0]
  }

  const selectedAlbum = albums[0]
  console.log(
    `⚠️  Multiple albums found for "${searchTerm}", using: "${selectedAlbum.title}" by ${getArtistName(selectedAlbum)}`
  )

  // Try to find exact match first
  const exactMatch = albums.find((album) => album.title.toLowerCase() === searchTerm.toLowerCase())

  if (exactMatch) {
    console.log(`✅ Found exact match: "${exactMatch.title}" by ${getArtistName(exactMatch)}`)
    return exactMatch
  }

  return selectedAlbum
}

const writeLogFiles = async (
  logPaths: { logFile: string; failLogFile: string; notFoundLogFile: string },
  logs: { successful: UpdateResult[]; failed: LogEntry[]; notFound: LogEntry[] }
): Promise<void> => {
  const { logFile, failLogFile, notFoundLogFile } = logPaths
  const { successful, failed, notFound } = logs

  if (successful.length > 0) {
    await fs.writeFile(logFile, JSON.stringify(successful, null, 2))
    console.log(`📝 Wrote ${successful.length} successful updates to ${logFile}`)
  }

  if (failed.length > 0) {
    await fs.writeFile(failLogFile, JSON.stringify(failed, null, 2))
    console.log(`❗️ Wrote ${failed.length} failures to ${failLogFile}`)
  }

  if (notFound.length > 0) {
    await fs.writeFile(notFoundLogFile, JSON.stringify(notFound, null, 2))
    console.log(`🔍 Wrote ${notFound.length} not found albums to ${notFoundLogFile}`)
  }
}

const processAlbumStatusUpdate = async (
  albumTitle: string,
  targetStatus: boolean,
  operation: OperationType,
  index: number,
  total: number
): Promise<{
  success: boolean
  result?: UpdateResult
  error?: LogEntry
  notFound?: LogEntry
}> => {
  const actionText = operation === 'add' ? 'Adding A-Plus status to' : 'Removing A-Plus status from'
  console.log(`[${index + 1}/${total}] ${actionText}: "${albumTitle}"`)

  try {
    const existingAlbums = await findAlbumByTitle(albumTitle)

    if (existingAlbums.length === 0) {
      console.log(`❌ Album not found: "${albumTitle}"`)
      return {
        success: false,
        notFound: {
          title: albumTitle,
          reason: 'Album not found in database',
          timestamp: new Date().toISOString(),
        },
      }
    }

    const selectedAlbum = selectBestMatch(existingAlbums, albumTitle)
    const wasAlreadyInDesiredState = selectedAlbum.isAPlus === targetStatus

    if (wasAlreadyInDesiredState) {
      const statusText = targetStatus ? 'already A-Plus' : 'already not A-Plus'
      console.log(
        `ℹ️  "${selectedAlbum.title}" by ${getArtistName(selectedAlbum)} is ${statusText}`
      )
    }

    // Update the A-Plus status
    await prisma.album.update({
      where: { id: selectedAlbum.id },
      data: { isAPlus: targetStatus },
    })

    const successText = targetStatus ? 'Added A-Plus status to' : 'Removed A-Plus status from'
    console.log(`✅ ${successText} "${selectedAlbum.title}" by ${getArtistName(selectedAlbum)}`)

    return {
      success: true,
      result: {
        albumId: selectedAlbum.id,
        title: selectedAlbum.title,
        artist: getArtistName(selectedAlbum),
        searchTerm: albumTitle,
        isExactMatch: selectedAlbum.title.toLowerCase() === albumTitle.toLowerCase(),
        alternativesFound: existingAlbums.length - 1,
        wasAlreadyInDesiredState,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error(`❌ Error processing album "${albumTitle}":`, error)
    return {
      success: false,
      error: {
        title: albumTitle,
        reason: String(error),
        timestamp: new Date().toISOString(),
      },
    }
  }
}

const updateAPlusStatus = async (
  albumTitles: string[],
  operation: OperationType
): Promise<ProcessingStats> => {
  const stats: ProcessingStats = { total: 0, updated: 0, failed: 0, notFound: 0 }
  const targetStatus = operation === 'add'
  const actionText = operation === 'add' ? 'addition' : 'removal'

  try {
    console.log(`⭐ Starting A-Plus status ${actionText}...`)
    stats.total = albumTitles.length
    console.log(
      `📀 ${operation === 'add' ? 'Adding' : 'Removing'} A-Plus status ${operation === 'add' ? 'to' : 'from'} ${stats.total} albums`
    )

    const logPaths = await setupLogging(operation)
    const logs = {
      successful: [] as UpdateResult[],
      failed: [] as LogEntry[],
      notFound: [] as LogEntry[],
    }

    for (let i = 0; i < albumTitles.length; i++) {
      const result = await processAlbumStatusUpdate(
        albumTitles[i],
        targetStatus,
        operation,
        i,
        albumTitles.length
      )

      if (result.success && result.result) {
        stats.updated++
        logs.successful.push(result.result)
      } else if (result.notFound) {
        stats.notFound++
        logs.notFound.push(result.notFound)
      } else if (result.error) {
        stats.failed++
        logs.failed.push(result.error)
      }
    }

    await writeLogFiles(logPaths, logs)
    return stats
  } catch (error) {
    console.error(`❌ A-Plus ${actionText} failed:`, error)
    throw error
  }
}

const addAPlusStatus = (albumTitles: string[]) => updateAPlusStatus(albumTitles, 'add')
const removeAPlusStatus = (albumTitles: string[]) => updateAPlusStatus(albumTitles, 'remove')

const clearAllAPlusStatus = async (): Promise<number> => {
  try {
    console.log('🧹 Clearing all A-Plus status...')
    const clearResult = await prisma.album.updateMany({
      data: { isAPlus: false },
    })
    console.log(`✅ Cleared A-Plus status from ${clearResult.count} albums`)
    return clearResult.count
  } catch (error) {
    console.error('❌ Failed to clear A-Plus status:', error)
    throw error
  }
}

const listAPlusAlbums = async () => {
  try {
    console.log('📋 Listing current A-Plus albums...')
    const aPlusAlbums = await prisma.album.findMany({
      where: { isAPlus: true },
      include: {
        artist: { select: { name: true } },
      },
      orderBy: { title: 'asc' },
    })

    console.log(`Found ${aPlusAlbums.length} A-Plus albums:`)
    aPlusAlbums.forEach((album, index) => {
      console.log(`${index + 1}. "${album.title}" by ${getArtistName(album)}`)
    })

    return aPlusAlbums
  } catch (error) {
    console.error('❌ Failed to list A-Plus albums:', error)
    throw error
  }
}

const printUsage = (): void => {
  console.log('❌ Invalid command. Available commands:')
  console.log('  add    - Add A-Plus status to specified albums')
  console.log('  remove - Remove A-Plus status from specified albums')
  console.log('  clear  - Remove A-Plus status from all albums')
  console.log('  list   - List all current A-Plus albums')
  console.log('')
  console.log('Examples:')
  console.log('  yarn scripts:manage-aplus add "Abbey Road" "Pet Sounds"')
  console.log('  yarn scripts:manage-aplus remove "Album Title"')
  console.log('  yarn scripts:manage-aplus list')
  console.log('  yarn scripts:manage-aplus clear')
}

const printStats = (stats: ProcessingStats, operation: string): void => {
  console.log(`\n📊 A-Plus ${operation} Summary:`)
  console.log(`Total albums processed: ${stats.total}`)
  console.log(`Successfully updated: ${stats.updated}`)
  console.log(`Not found in database: ${stats.notFound}`)
  console.log(`Failed to update: ${stats.failed}`)
  if (stats.total > 0) {
    console.log(`Success rate: ${((stats.updated / stats.total) * 100).toFixed(1)}%`)
  }
}

// Main execution logic
const main = async (): Promise<void> => {
  const args = process.argv.slice(2)
  const command = args[0]

  try {
    switch (command) {
      case 'add': {
        const albumTitles = args.slice(1)
        if (albumTitles.length === 0) {
          console.log('❌ Please provide album titles to add A-Plus status to.')
          console.log('Usage: yarn scripts:manage-aplus add "Album Title 1" "Album Title 2"')
          process.exit(1)
        }
        const stats = await addAPlusStatus(albumTitles)
        printStats(stats, 'Addition')
        break
      }

      case 'remove': {
        const albumTitles = args.slice(1)
        if (albumTitles.length === 0) {
          console.log('❌ Please provide album titles to remove A-Plus status from.')
          console.log('Usage: yarn scripts:manage-aplus remove "Album Title 1" "Album Title 2"')
          process.exit(1)
        }
        const stats = await removeAPlusStatus(albumTitles)
        printStats(stats, 'Removal')
        break
      }

      case 'clear': {
        const clearedCount = await clearAllAPlusStatus()
        console.log(`\n📊 Cleared A-Plus status from ${clearedCount} albums`)
        break
      }

      case 'list': {
        await listAPlusAlbums()
        break
      }

      default: {
        printUsage()
        process.exit(1)
      }
    }

    console.log('🎉 A-Plus management completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('💥 A-Plus management failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Execute with proper error handling
main()
