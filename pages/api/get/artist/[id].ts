import {PRISMA_CLIENT} from '../../../../utils/api/constants'

/**
 * It takes a query parameter called `id` and uses it to fetch an artist from the
 * Prisma database
 * @param req - The request object.
 * @param res - The response object.
 * @returns The artist with the id that was passed in the query string.
 */
export default async function handler(req, res) {
  if (req.query.id) {
    try {
      const artist = await PRISMA_CLIENT.artist.findUnique({
        where: {
          id: req.query.id,
        },
        include: {
          albums: true,
        },
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({...artist}))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({error}))
    }
  }
}
