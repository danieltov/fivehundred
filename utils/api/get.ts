import {ALBUM_INCLUDE, PRISMA_CLIENT} from './constants'

/**
 * It takes an array and returns a random element from that array
 * @param {any[]} array - The array to pick a random element from.
 * @returns A random element from the array.
 */
export function randomPick(array: any[]) {
  // eslint-disable-next-line no-bitwise
  return array[~~(Math.random() * array.length)]
}

export async function pickRandom(count: number) {
  const itemCount = await PRISMA_CLIENT.album.count()
  const skip = Math.max(0, Math.floor(Math.random() * itemCount) - count)
  const orderBy = randomPick(['id', 'releaseDate', 'title'])
  const order = randomPick(['asc', 'desc'])
  const albums = await PRISMA_CLIENT.album.findMany({
    take: count,
    skip,
    orderBy: {
      [orderBy]: order,
    },
    include: ALBUM_INCLUDE,
  })
  return albums
}
