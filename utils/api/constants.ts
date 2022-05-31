import {PrismaClient} from '@prisma/client'

/** URL Components */
export const LUCKY_DUCKY_BASE = 'https://duckduckgo.com/?q=!ducky+site:rateyourmusic.com/release+'

/* Selectors */
export const ALBUM_DESCRIPTOR_SELECTOR = '.release_pri_descriptors'
export const ALBUM_TITLE_SELECTOR = 'div.album_title'
export const ALBUM_ARTIST_SELECTOR = 'table.album_info .artist'
export const ALBUM_DATE_SELECTOR = 'table.album_info > tbody > tr:nth-child(3)'
export const ALBUM_COVER_SELECTOR = '.page_release_art_frame img'

/* Prisma */
export const PRISMA_CLIENT = new PrismaClient()
export const ALBUM_INCLUDE = {
  artist: true,
  genres: true,
  descriptors: true,
  tier: true,
}

/* Mock Data */
export const MOCK_ALBUM_DATA = {
  coverArt:
    'https://e.snmc.io/i/600/w/b74f26b280262dae8bb4cbb7e439f484/6123498/sly-and-the-family-stone-theres-a-riot-goin-on-Cover-Art.jpg',
  id: 'cl3rvo79y2206gldz7isoy7v4',
  lastPlayed: null,
  owned: false,
  ownedDate: null,
  releaseDate: '1971-11-20T06:00:00.000Z',
  title: "There's a Riot Goin' On",
  artist: [{id: 'cl3rvo79y2210gldzu2lpqnx6', name: 'Sly & The Family Stone'}],
  genres: [
    {id: 'cl3rkzg9o0837gkdz54h213uu', name: 'Funk'},
    {id: 'cl3rvnojd1518gldzklrh50d2', name: 'Psychedelic Soul'},
    {id: 'cl3rvo79z2243gldzb2t6ww1y', name: 'Deep Funk'},
  ],
  descriptors: [
    {id: 'cl3rkdrtc00577adzvge5txjk', name: 'female vocals'},
    {id: 'cl3rkdrtc00607adzimsfzlti', name: 'mellow'},
    {id: 'cl3rkdrtc00657adzphj8exub', name: 'passionate'},
    {id: 'cl3rkdrtc00687adzkwz4b66h', name: 'melancholic'},
    {id: 'cl3rkdrtc00757adz2cn0pocm', name: 'bittersweet'},
    {id: 'cl3rkdrtc00897adztcw1jcw0', name: 'conscious'},
    {id: 'cl3rkdrtc00937adzq2bo95wu', name: 'introspective'},
    {id: 'cl3rkdrtc01017adz7jbir87y', name: 'male vocals'},
    {id: 'cl3rkdrtc01177adzfga1n7l8', name: 'nocturnal'},
    {id: 'cl3rkdrtc01207adzxmiaeoyg', name: 'dense'},
    {id: 'cl3rkdrtc01217adz5zms9no7', name: 'rhythmic'},
    {id: 'cl3rkdrtc01527adzstzbnv97', name: 'atmospheric'},
    {id: 'cl3rkdrtc01697adzp6xgfmad', name: 'lonely'},
    {id: 'cl3rkdrtd01797adzo5twev8j', name: 'lethargic'},
    {id: 'cl3rkdrtd01917adz9n5uyn3v', name: 'surreal'},
    {id: 'cl3rkzg9k0122gkdzzngllmsp', name: 'poetic'},
    {id: 'cl3rkzg9l0174gkdzvhhtzhfb', name: 'cryptic'},
    {id: 'cl3rkzg9l0196gkdzd4nxzziq', name: 'urban'},
    {id: 'cl3rkzg9l0220gkdzf5zatgvs', name: 'existential'},
    {id: 'cl3rkzg9l0243gkdzz0y29ixw', name: 'raw'},
    {id: 'cl3rkzg9l0258gkdzedfy6ja1', name: 'lo-fi'},
    {id: 'cl3rkzg9l0273gkdzfq0wo86u', name: 'warm'},
    {id: 'cl3rkzg9l0317gkdzeoddlp0u', name: 'depressive'},
    {id: 'cl3rkzg9l0355gkdzfr3vs7sb', name: 'psychedelic'},
    {id: 'cl3rkzg9m0629gkdzvfrgunjb', name: 'hypnotic'},
    {id: 'cl3rkzg9m0643gkdzljfxkora', name: 'dark'},
    {id: 'cl3rlf3t80017qadzwu4bijgv', name: 'sarcastic'},
    {id: 'cl3rlf3t80103qadz3s6bhxp8', name: 'political'},
    {id: 'cl3rlf3t90140qadzqfu1d1gk', name: 'pessimistic'},
    {id: 'cl3rlf3tx1874qadzf87t0gqq', name: 'drugs'},
  ],
}
