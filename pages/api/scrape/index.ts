/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { ScrapedAlbum } from '../../../@types/api'
import {
  ALBUM_ARTIST_SELECTOR,
  ALBUM_COVER_SELECTOR,
  ALBUM_DATE_SELECTOR,
  ALBUM_DESCRIPTOR_SELECTOR,
  ALBUM_TITLE_SELECTOR,
  LUCKY_DUCKY_BASE,
} from '../../../lib/constants'

const prisma = new PrismaClient()

/**
 * It scrapes the album page for the album with the given query, saves the scraped
 * data to the database, and returns the scraped data to the client
 * @param req - The incoming request object.
 * @param res - The response object.
 * @returns An object with the following properties: COVER, TITLE, DATE, DESCRIPTORS, ARTIST
 */
export default async function handler(req, res) {
  if (req.query.query && typeof req.query.query === 'string') {
    puppeteer.use(StealthPlugin())
    const browser = await puppeteer.launch({
      headless: true,
    })
    const albumPage = await browser.newPage()
    await albumPage.goto(LUCKY_DUCKY_BASE + req.query.query)
    await albumPage.waitForSelector(ALBUM_COVER_SELECTOR)

    const album = {} as ScrapedAlbum

    album.COVER = await albumPage.$$eval(ALBUM_COVER_SELECTOR, (el: HTMLImageElement[]) => el[0].src)

    album.TITLE = await albumPage.$$eval(ALBUM_TITLE_SELECTOR, (el: HTMLDivElement[]) => el[0].innerText)

    album.ARTIST = await albumPage.$$eval(ALBUM_ARTIST_SELECTOR, (el) => el[0].textContent)

    album.RELEASE_DATE =
      new Date(
        await albumPage.$$eval(ALBUM_DATE_SELECTOR, (el) => el[0].textContent.replace('Released', '').trim())
      ).toISOString() || ''

    album.GENRES = Array.from(await albumPage.$$eval('.genre', (el: HTMLAnchorElement[]) => el.map((e) => e.outerText)))

    album.DESCRIPTORS =
      (await albumPage.$$eval(ALBUM_DESCRIPTOR_SELECTOR, (el) => el[0].textContent.split(',').map((g) => g.trim()))) ||
      []

    await browser.close()

    // save to DB
    await prisma.album.create({
      data: {
        title: album.TITLE,
        coverArt: album.COVER,
        releaseDate: album.RELEASE_DATE,
        artist: {
          connectOrCreate: {
            where: { name: album.ARTIST },
            create: { name: album.ARTIST },
          },
        },
        genres: {
          connectOrCreate: album.GENRES.map((genre) => ({
            where: { name: genre },
            create: { name: genre },
          })),
        },
        descriptors: {
          connectOrCreate: album.DESCRIPTORS.map((descriptor) => ({
            where: { name: descriptor },
            create: { name: descriptor },
          })),
        },
      },
    })

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ ...album }))
  }
  res.statusCode = 404
  res.setHeader('Content-Type', 'application/json')
  return res.end(JSON.stringify({ error: 'Bad request' }))
}
