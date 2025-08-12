/* eslint-disable no-console */
import { promises as fs } from 'fs'

import { scrapeAllMusicUrls, ScrapeResult } from '../lib/allmusic-scraper'
import { getMusicBrainzAlbumData } from '../lib/musicbrainz'
import prisma from '../lib/prisma'
import { slugify } from '../lib/utils'

// Types
interface ProcessingStats {
  total: number
  successful: number
  failed: number
  updated: number
  alreadyUpToDate: number
}

interface UpdateResult {
  albumId: string
  title: string
  artist: string
  searchTerm: string
  fieldsUpdated: string[]
  wasAlreadyComplete: boolean
  timestamp: string
}

interface LogEntry {
  searchTerm: string
  reason: string
  timestamp: string
}

// Utility functions
const createTimestamp = (): string => new Date().toISOString().replace(/[:.]/g, '-')

const setupLogging = async (): Promise<{
  logsDir: string
  logFile: string
  failLogFile: string
}> => {
  const timestamp = createTimestamp()
  const logsDir = `${process.cwd()}/logs`

  await fs.mkdir(logsDir, { recursive: true })

  return {
    logsDir,
    logFile: `${logsDir}/allmusic-scrape-${timestamp}.json`,
    failLogFile: `${logsDir}/allmusic-scrape-failures-${timestamp}.json`,
  }
}

const writeLogFiles = async (
  logPaths: { logFile: string; failLogFile: string },
  logs: { successful: UpdateResult[]; failed: LogEntry[] }
): Promise<void> => {
  const { logFile, failLogFile } = logPaths
  const { successful, failed } = logs

  if (successful.length > 0) {
    await fs.writeFile(logFile, JSON.stringify(successful, null, 2))
    console.log(`📝 Wrote ${successful.length} successful updates to ${logFile}`)
  }

  if (failed.length > 0) {
    await fs.writeFile(failLogFile, JSON.stringify(failed, null, 2))
    console.log(`❗️ Wrote ${failed.length} failures to ${failLogFile}`)
  }
}

const findAlbumByArtistAndTitle = async (artist: string, title: string) => {
  // More specific search using both artist and title
  const albums = await prisma.album.findMany({
    where: {
      AND: [
        {
          title: {
            contains: title,
            mode: 'insensitive' as const,
          },
        },
        {
          artist: {
            some: {
              name: {
                contains: artist,
                mode: 'insensitive' as const,
              },
            },
          },
        },
      ],
    },
    include: {
      artist: { select: { name: true } },
      genres: { select: { name: true } },
      descriptors: { select: { name: true } },
    },
  })

  return albums
}

const createOrFindArtist = async (name: string) => {
  const slug = slugify(name)

  return await prisma.artist.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  })
}

const createAlbumWithScrapedData = async (
  scrapedData: ScrapeResult
): Promise<UpdateResult | null> => {
  if (!scrapedData.success || !scrapedData.data) {
    return null
  }

  const data = scrapedData.data

  // Check if album already exists before creating
  const albumSlug = slugify(`${data.artist} ${data.album}`)
  const existingAlbum = await prisma.album.findUnique({
    where: { slug: albumSlug },
    include: {
      artist: { select: { name: true } },
      genres: { select: { name: true } },
      descriptors: { select: { name: true } },
    },
  })

  if (existingAlbum) {
    console.log(`ℹ️  Album "${data.album}" by ${data.artist} already exists, updating instead`)
    // Use the existing album update logic
    return await updateAlbumWithScrapedData(scrapedData, existingAlbum.id)
  }

  // Create or find the artist
  const artist = await createOrFindArtist(data.artist)

  // Create or find genres (including styles)
  const genreNames: string[] = []

  // Add main genres
  if (data.genre) {
    genreNames.push(
      ...data.genre
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    )
  }

  // Add styles as genres
  if (data.styles) {
    genreNames.push(
      ...data.styles
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  }

  for (const genreName of genreNames) {
    await prisma.genre.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName, slug: slugify(genreName) },
    })
  }

  // Create or find descriptors (moods and themes only)
  const descriptorTexts: string[] = []
  if (data.moods)
    descriptorTexts.push(
      ...data.moods
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
    )
  if (data.themes)
    descriptorTexts.push(
      ...data.themes
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    )

  for (const descriptorText of descriptorTexts) {
    await prisma.descriptor.upsert({
      where: { name: descriptorText },
      update: {},
      create: { name: descriptorText, slug: slugify(descriptorText) },
    })
  }

  // Get the created/found genres and descriptors
  const genres = await prisma.genre.findMany({
    where: { name: { in: genreNames } },
  })

  const descriptors = await prisma.descriptor.findMany({
    where: { name: { in: descriptorTexts } },
  })

  // Parse release date
  let releaseDate: Date
  try {
    releaseDate = data.publishedDate ? new Date(data.publishedDate) : new Date()
  } catch (error) {
    console.log(`⚠️  Invalid date format: ${data.publishedDate}, using current date`)
    releaseDate = new Date()
  }

  // Fetch cover art from MusicBrainz
  console.log(`🎨 Looking up cover art for "${data.album}" by ${data.artist}...`)
  let coverArtUrl = ''
  try {
    const musicBrainzData = await getMusicBrainzAlbumData(data.artist, data.album)
    if (musicBrainzData.coverArt) {
      coverArtUrl = musicBrainzData.coverArt
      console.log(`✅ Found cover art: ${coverArtUrl}`)
    } else {
      console.log(`⚠️  No cover art found for "${data.album}" by ${data.artist}`)
    }
  } catch (error) {
    console.error(`❌ Error fetching cover art:`, error)
  }

  // Create the album
  const newAlbum = await prisma.album.create({
    data: {
      title: data.album,
      slug: albumSlug,
      releaseDate,
      allMusicId: data.amgId,
      coverArt: coverArtUrl ?? '',
      artist: {
        connect: { id: artist.id },
      },
      genres: {
        connect: genres.map((g) => ({ id: g.id })),
      },
      descriptors: {
        connect: descriptors.map((d) => ({ id: d.id })),
      },
    },
    include: {
      artist: { select: { name: true } },
    },
  })

  console.log(
    `✅ Created new album "${newAlbum.title}" by ${artist.name} with ${genres.length} genres and ${descriptors.length} descriptors${
      coverArtUrl ? ' and cover art' : ''
    }`
  )

  return {
    albumId: newAlbum.id,
    title: newAlbum.title,
    artist: artist.name,
    searchTerm: scrapedData.originalInput,
    fieldsUpdated: ['created'],
    wasAlreadyComplete: false,
    timestamp: new Date().toISOString(),
  }
}

const updateAlbumWithScrapedData = async (
  scrapedData: ScrapeResult,
  albumId?: string
): Promise<UpdateResult | null> => {
  if (!scrapedData.success || !scrapedData.data) {
    return null
  }

  const data = scrapedData.data
  let targetAlbum

  if (albumId) {
    // Use specific album ID
    targetAlbum = await prisma.album.findUnique({
      where: { id: albumId },
      include: {
        artist: { select: { name: true } },
        genres: { select: { name: true } },
        descriptors: { select: { name: true } },
      },
    })
  } else {
    // Find album by scraped data using improved search
    const albums = await findAlbumByArtistAndTitle(data.artist, data.album)

    if (albums.length === 0) {
      console.log(`❌ No matching album found for "${data.artist} - ${data.album}"`)
      return null
    }
    targetAlbum = albums[0]
    if (albums.length > 1) {
      console.log(
        `⚠️  Multiple albums found for "${data.artist} - ${data.album}", using first match`
      )
    }
  }

  if (!targetAlbum) {
    return null
  }

  const fieldsUpdated: string[] = []
  const updateData: any = {}

  // Update release date if available and different
  if (data.publishedDate && data.publishedDate !== targetAlbum.releaseDate?.toISOString()) {
    try {
      const releaseDate = new Date(data.publishedDate)
      updateData.releaseDate = releaseDate
      fieldsUpdated.push('releaseDate')
    } catch (error) {
      console.log(`⚠️  Invalid date format: ${data.publishedDate}`)
    }
  }

  // Update AllMusic ID if available
  if (data.amgId && data.amgId !== targetAlbum.allMusicId) {
    updateData.allMusicId = data.amgId
    fieldsUpdated.push('allMusicId')
  }

  // Handle genres (including styles)
  const genreNames: string[] = []

  // Add main genres
  if (data.genre) {
    genreNames.push(
      ...data.genre
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    )
  }

  // Add styles as genres
  if (data.styles) {
    genreNames.push(
      ...data.styles
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  }

  if (genreNames.length > 0) {
    for (const genreName of genreNames) {
      // Create or find genre
      await prisma.genre.upsert({
        where: { name: genreName },
        update: {},
        create: { name: genreName, slug: slugify(genreName) },
      })
    }

    // Connect genres to album
    const genres = await prisma.genre.findMany({
      where: { name: { in: genreNames } },
    })

    const currentGenreIds = targetAlbum.genres.map((g) => g.name)
    const newGenreIds = genres.map((g) => g.name)

    if (JSON.stringify(currentGenreIds.sort()) !== JSON.stringify(newGenreIds.sort())) {
      updateData.genres = {
        set: genres.map((g) => ({ id: g.id })),
      }
      fieldsUpdated.push('genres')
    }
  }

  // Handle descriptors (moods and themes only)
  const descriptorTexts: string[] = []
  if (data.moods)
    descriptorTexts.push(
      ...data.moods
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
    )
  if (data.themes)
    descriptorTexts.push(
      ...data.themes
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    )

  if (descriptorTexts.length > 0) {
    for (const descriptorText of descriptorTexts) {
      // Create or find descriptor
      await prisma.descriptor.upsert({
        where: { name: descriptorText },
        update: {},
        create: { name: descriptorText, slug: slugify(descriptorText) },
      })
    }

    // Connect descriptors to album
    const descriptors = await prisma.descriptor.findMany({
      where: { name: { in: descriptorTexts } },
    })

    const currentDescriptorIds = targetAlbum.descriptors.map((d) => d.name)
    const newDescriptorIds = descriptors.map((d) => d.name)

    if (JSON.stringify(currentDescriptorIds.sort()) !== JSON.stringify(newDescriptorIds.sort())) {
      updateData.descriptors = {
        set: descriptors.map((d) => ({ id: d.id })),
      }
      fieldsUpdated.push('descriptors')
    }
  }

  // Update album if there are changes
  if (fieldsUpdated.length > 0) {
    await prisma.album.update({
      where: { id: targetAlbum.id },
      data: updateData,
    })

    console.log(
      `✅ Updated "${targetAlbum.title}" by ${targetAlbum.artist[0]?.name} - Fields: ${fieldsUpdated.join(', ')}`
    )

    return {
      albumId: targetAlbum.id,
      title: targetAlbum.title,
      artist: targetAlbum.artist[0]?.name || 'Unknown',
      searchTerm: scrapedData.originalInput,
      fieldsUpdated,
      wasAlreadyComplete: false,
      timestamp: new Date().toISOString(),
    }
  } else {
    console.log(`ℹ️  "${targetAlbum.title}" by ${targetAlbum.artist[0]?.name} already up to date`)

    return {
      albumId: targetAlbum.id,
      title: targetAlbum.title,
      artist: targetAlbum.artist[0]?.name || 'Unknown',
      searchTerm: scrapedData.originalInput,
      fieldsUpdated: [],
      wasAlreadyComplete: true,
      timestamp: new Date().toISOString(),
    }
  }
}

const scrapeAndUpdateAlbums = async (queries: string[]): Promise<ProcessingStats> => {
  const stats: ProcessingStats = {
    total: 0,
    successful: 0,
    failed: 0,
    updated: 0,
    alreadyUpToDate: 0,
  }

  try {
    console.log('🎵 Starting AllMusic scraping and database update...')
    stats.total = queries.length
    console.log(`✨✨✨✨ Processing ${stats.total} album queries ✨✨✨✨`)

    const logPaths = await setupLogging()
    const logs = {
      successful: [] as UpdateResult[],
      failed: [] as LogEntry[],
    }

    // Scrape AllMusic data
    console.log('🕷️  Scraping AllMusic data...')
    const scrapeResults = await scrapeAllMusicUrls(queries)

    console.log(`\n📊 Scraping Summary:`)
    console.log(`Total queries: ${scrapeResults.summary.total}`)
    console.log(`Successful scrapes: ${scrapeResults.summary.successful}`)
    console.log(`Failed scrapes: ${scrapeResults.summary.failed}`)

    // Process successful scrapes
    console.log('\n💾 Updating database with scraped data...')
    for (let i = 0; i < scrapeResults.results.length; i++) {
      const result = scrapeResults.results[i]

      if (result.success) {
        console.log(
          `[${i + 1}/${scrapeResults.results.length}] Processing: ${result.originalInput}`
        )

        try {
          // First try to update existing album
          let updateResult = await updateAlbumWithScrapedData(result)

          // If no existing album found, create a new one
          if (!updateResult) {
            console.log(`📝 Creating new album for: ${result.originalInput}`)
            updateResult = await createAlbumWithScrapedData(result)
          }

          if (updateResult) {
            stats.successful++
            logs.successful.push(updateResult)

            if (updateResult.fieldsUpdated.includes('created')) {
              stats.updated++ // Count new albums as "updated"
            } else if (updateResult.wasAlreadyComplete) {
              stats.alreadyUpToDate++
            } else {
              stats.updated++
            }
          } else {
            stats.failed++
            logs.failed.push({
              searchTerm: result.originalInput,
              reason: 'Failed to create or update album',
              timestamp: new Date().toISOString(),
            })
          }
        } catch (error) {
          stats.failed++
          logs.failed.push({
            searchTerm: result.originalInput,
            reason: `Database update error: ${error}`,
            timestamp: new Date().toISOString(),
          })
        }
      } else {
        stats.failed++
        logs.failed.push({
          searchTerm: result.originalInput,
          reason: `Scraping failed: ${result.error}`,
          timestamp: new Date().toISOString(),
        })
      }
    }

    await writeLogFiles(logPaths, logs)
    return stats
  } catch (error) {
    console.error('❌ AllMusic scraping failed:', error)
    throw error
  }
}

const printUsage = (): void => {
  console.log('❌ Invalid command. Available commands:')
  console.log('  scrape - Scrape AllMusic data for specified album queries')
  console.log('')
  console.log('Examples:')
  console.log('  yarn scripts:scrape-allmusic scrape "Abbey Road" "Pet Sounds"')
  console.log('  yarn scripts:scrape-allmusic scrape "The Beatles Abbey Road"')
  console.log('  yarn scripts:scrape-allmusic scrape "mw0000191956"  # Direct AllMusic ID')
}

const printStats = (stats: ProcessingStats): void => {
  console.log(`\n📊 AllMusic Scraping Summary:`)
  console.log(`Total queries processed: ${stats.total}`)
  console.log(`Successfully processed: ${stats.successful}`)
  console.log(`Albums updated: ${stats.updated}`)
  console.log(`Albums already up to date: ${stats.alreadyUpToDate}`)
  console.log(`Failed to process: ${stats.failed}`)
  if (stats.total > 0) {
    console.log(`Success rate: ${((stats.successful / stats.total) * 100).toFixed(1)}%`)
  }
}

// Main execution logic
const main = async (): Promise<void> => {
  const args = process.argv.slice(2)
  const command = args[0]

  try {
    switch (command) {
      case 'scrape': {
        const queries = args.slice(1)
        if (queries.length === 0) {
          console.log('❌ Please provide album queries to scrape.')
          console.log('Usage: yarn scripts:scrape-allmusic scrape "Album Title" "Artist - Album"')
          process.exit(1)
        }
        const stats = await scrapeAndUpdateAlbums(queries)
        printStats(stats)
        break
      }

      default: {
        printUsage()
        process.exit(1)
      }
    }

    console.log('🎉 AllMusic scraping completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('💥 AllMusic scraping failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Execute with proper error handling
main()
