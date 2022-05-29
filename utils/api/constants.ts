/** URL Components */
export const LUCKY_DUCKY_BASE = 'https://duckduckgo.com/?q=!ducky+site:rateyourmusic.com/release+'

/** Fetch components */
export const HEADERS = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
})

/* Selectors */
export const ALBUM_RESULTS_SELECTOR =
    '#column_container_left > div.page_search_results > table > tbody > tr > td > table:nth-child(4) > tbody > tr > td:nth-child(2) > table > tbody > tr > td > i > a'
export const ALBUM_DESCRIPTOR_SELECTOR = '.release_pri_descriptors'
export const ALBUM_TITLE_SELECTOR = 'div.album_title'
export const ALBUM_ARTIST_SELECTOR = 'table.album_info .artist'
export const ALBUM_DATE_SELECTOR = 'table.album_info > tbody > tr:nth-child(3)'
export const ALBUM_COVER_SELECTOR = '.page_release_art_frame img'
