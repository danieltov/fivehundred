/* eslint-disable no-console */
import puppeteer from "puppeteer";
import {
  ALBUM_ARTIST_SELECTOR,
  ALBUM_COVER_SELECTOR,
  ALBUM_DATE_SELECTOR,
  ALBUM_TITLE_SELECTOR,
  ALBUM_VIBE_SELECTOR,
  LUCKY_DUCKY_BASE
} from "../../utils/api/constants";

export default async function handler(req, res) {
  if (req.query.query && typeof req.query.query === "string") {
    const browser = await puppeteer.launch();
    const albumPage = await browser.newPage();
    await albumPage.goto(LUCKY_DUCKY_BASE + req.query.query, {
      waitUntil: "networkidle2",
    });

    const album: { [x: string]: string | string[] } = {};

    album.COVER = await albumPage.$$eval(
      ALBUM_COVER_SELECTOR,
      (el: HTMLImageElement[]) => el[0].src
    );

    album.TITLE = await albumPage.$$eval(
      ALBUM_TITLE_SELECTOR,
      (el: HTMLDivElement[]) => el[0].innerText
    );

    album.ARTIST = await albumPage.$$eval(
      ALBUM_ARTIST_SELECTOR,
      (el) => el[0].textContent
    );

    album.RELEASE_DATE =
      new Date(
        await albumPage.$$eval(ALBUM_DATE_SELECTOR, (el) =>
          el[0].textContent.replace("Released", "").trim()
        )
      ).toISOString() || "";

    album.GENRES = Array.from(
      await albumPage.$$eval(".genre", (el: HTMLAnchorElement[]) =>
        el.map((e) => e.outerText)
      )
    );

    album.VIBES =
      (await albumPage.$$eval(ALBUM_VIBE_SELECTOR, (el) =>
        el[0].textContent.split(",").map((g) => g.trim())
      )) || [];

    await browser.close();

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ...album }));
  }
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify({ error: "Bad request" }));
}
