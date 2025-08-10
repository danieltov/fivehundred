/**
 * AllMusic scraper integration for Five Hundred project
 * Adapted from allmusic-scraper package to work with CSV/database integration
 */

import puppeteer from 'puppeteer'

export interface AllMusicScrapedData {
  publishedDate: string
  amgId: string
  artist: string
  album: string
  genre: string
  styles: string
  moods: string
  themes: string
}

export interface ScrapeResult {
  success: boolean
  data?: AllMusicScrapedData
  error?: string
  originalInput: string
}

/**
 * Search for album on AllMusic and get the album ID
 */
async function searchAlbumId(page: puppeteer.Page, albumQuery: string): Promise<string | null> {
  try {
    const searchQuery = encodeURIComponent(albumQuery)
    const searchUrl = `https://www.allmusic.com/search/albums/${searchQuery}`

    console.log(`Searching for album: ${albumQuery}`)
    await page.goto(searchUrl, { timeout: 30000, waitUntil: 'domcontentloaded' })

    // Look for album links in search results
    const albumLinks = await page.$$('a[href*="/album/"]')

    if (albumLinks.length > 0) {
      // Get the first album result URL
      const href = await albumLinks[0].evaluate((el) => el.getAttribute('href'))

      // Extract album ID from URL (e.g., "/album/electric-warrior-mw0000196673" -> "mw0000196673")
      const albumId = href?.split('-').pop()
      console.log(`Found album ID: ${albumId} for query: ${albumQuery}`)
      return albumId || null
    } else {
      console.warn(`No album found for: ${albumQuery}`)
      return null
    }
  } catch (searchError) {
    console.error(`Search failed for album: ${albumQuery}:`, searchError)
    return null
  }
}

/**
 * Scrape album metadata from AllMusic page
 */
async function scrapeAlbumData(
  page: puppeteer.Page,
  albumId: string
): Promise<AllMusicScrapedData | null> {
  try {
    const baseUrl = 'https://www.allmusic.com/album/'
    await page.goto(baseUrl + albumId, { timeout: 30000, waitUntil: 'domcontentloaded' })

    const STYLES_SELECTOR = '.styles'
    const JSON_SELECTOR = 'script[type="application/ld+json"]'
    const MOODS_THEMES_TAB_SELECTOR = '#moodsThemesTab'
    const MOODS_SELECTOR = '#moodsGrid a'
    const THEMES_SELECTOR = '#themesGrid a'

    // Get JSON-LD metadata
    const json = await page.$(JSON_SELECTOR)
    if (!json) {
      throw new Error('No JSON-LD metadata found')
    }
    const jsondata = await json.evaluate((element) => element.textContent)
    const metadata = JSON.parse(jsondata || '{}')

    // Get styles data
    const styles = await page.$(STYLES_SELECTOR)
    const styledata = await styles?.evaluate((element) => element.textContent)

    // Handle moods and themes with retry logic
    let moodsData = ''
    let themesData = ''

    try {
      await page.waitForSelector(MOODS_THEMES_TAB_SELECTOR, { timeout: 5000 })
      console.log(`Moods/Themes tab found for album ${albumId}`)

      let attempts = 0
      const maxAttempts = 3
      let contentLoaded = false

      while (attempts < maxAttempts && !contentLoaded) {
        attempts++
        console.log(`Attempt ${attempts} to load moods/themes for album ${albumId}`)

        try {
          // Click the tab
          await page.click(MOODS_THEMES_TAB_SELECTOR)

          // Wait for content to appear
          await page.waitForSelector('#moodsThemes', { timeout: 3000 })
          await page.waitForTimeout(500)

          // Extract content
          const moodsElements = await page.$$(MOODS_SELECTOR)
          const themesElements = await page.$$(THEMES_SELECTOR)

          if (moodsElements.length > 0 || themesElements.length > 0) {
            contentLoaded = true

            // Extract moods
            const moods = []
            for (const mood of moodsElements) {
              const text = await mood.evaluate((el) => el.textContent)
              if (text) moods.push(text)
            }
            moodsData = moods.join(', ')

            // Extract themes
            const themes = []
            for (const theme of themesElements) {
              const text = await theme.evaluate((el) => el.textContent)
              if (text) themes.push(text)
            }
            themesData = themes.join(', ')

            console.log(`Found ${moodsElements.length} moods and ${themesElements.length} themes`)
          } else if (attempts < maxAttempts) {
            await page.waitForTimeout(1000)
          }
        } catch (clickError) {
          console.log(`Click attempt ${attempts} failed:`, clickError)
          if (attempts < maxAttempts) {
            await page.waitForTimeout(1000)
          }
        }
      }
    } catch (tabError) {
      console.log(`No moods/themes tab found for album ${albumId}`)
    }

    // Format the data
    return {
      publishedDate: metadata?.datePublished || '',
      amgId: albumId,
      artist: metadata?.byArtist?.[0]?.name || '',
      album: metadata?.name || '',
      genre: metadata?.genre?.join(',') || '',
      styles: styledata?.substring(7)?.split('\n')?.join(', ') || '',
      moods: moodsData,
      themes: themesData,
    }
  } catch (error) {
    console.error(`Error scraping album ${albumId}:`, error)
    return null
  }
}

/**
 * Process a single URL item (can be album ID, album path, or search query)
 */
async function processSingleItem(page: puppeteer.Page, urlItem: string): Promise<ScrapeResult> {
  let albumId: string | null = null

  try {
    // Determine if this is a direct album ID/path or a search query
    if (urlItem.startsWith('mw') || urlItem.startsWith('/album/')) {
      // Direct album ID or path
      albumId = urlItem.startsWith('/album/') ? urlItem.split('-').pop() || null : urlItem
    } else {
      // Search for the album
      albumId = await searchAlbumId(page, urlItem)
    }

    if (!albumId) {
      return {
        success: false,
        error: 'Could not find album ID',
        originalInput: urlItem,
      }
    }

    // Scrape the album data
    const data = await scrapeAlbumData(page, albumId)

    if (!data) {
      return {
        success: false,
        error: 'Could not scrape album data',
        originalInput: urlItem,
      }
    }

    return {
      success: true,
      data,
      originalInput: urlItem,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      originalInput: urlItem,
    }
  }
}

/**
 * Main scraper function that accepts array of URLs/queries
 */
export async function scrapeAllMusicUrls(urlList: string[]): Promise<{
  results: ScrapeResult[]
  summary: {
    total: number
    successful: number
    failed: number
  }
}> {
  if (!urlList || urlList.length === 0) {
    throw new Error('URL list is empty')
  }

  console.log(`Starting AllMusic scrape for ${urlList.length} items`)

  const browserOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
    ],
  }

  const browser = await puppeteer.launch(browserOptions)
  const page = await browser.newPage()

  await page.setViewport({ width: 1024, height: 1280 })
  await page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)')

  const results: ScrapeResult[] = []

  try {
    // Process each URL sequentially to avoid overwhelming AllMusic
    for (let i = 0; i < urlList.length; i++) {
      const urlItem = urlList[i].trim()
      if (!urlItem) continue

      console.log(`Processing ${i + 1}/${urlList.length}: ${urlItem}`)

      const result = await processSingleItem(page, urlItem)
      results.push(result)

      // Add delay between requests to be respectful
      if (i < urlList.length - 1) {
        await page.waitForTimeout(1000)
      }
    }
  } finally {
    await page.close()
    await browser.close()
  }

  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`AllMusic scraping complete: ${successful} successful, ${failed} failed`)

  return {
    results,
    summary: {
      total: urlList.length,
      successful,
      failed,
    },
  }
}
