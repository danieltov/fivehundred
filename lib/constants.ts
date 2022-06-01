/** URL Components */
export const LUCKY_DUCKY_BASE = 'https://duckduckgo.com/?q=!ducky+site:rateyourmusic.com/release+'

/* Selectors */
export const ALBUM_DESCRIPTOR_SELECTOR = '.release_pri_descriptors'
export const ALBUM_TITLE_SELECTOR = 'div.album_title'
export const ALBUM_ARTIST_SELECTOR = 'table.album_info .artist'
export const ALBUM_DATE_SELECTOR = 'table.album_info > tbody > tr:nth-child(3)'
export const ALBUM_COVER_SELECTOR = '.page_release_art_frame img'

/* Prisma */
export const ALBUM_INCLUDE = {
  artist: true,
  genres: true,
  descriptors: true,
  tier: true,
}
