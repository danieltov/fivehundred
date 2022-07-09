import { ALBUM_INCLUDE } from '../../../lib/constants'
import prisma from '../../../lib/prisma'

/**
 * It takes a query parameter called `id` and uses it to query the Prisma database
 * for an album with that id. If it finds one, it returns it as JSON. If it doesn't
 * find one, it returns an error
 * @param req - The request object.
 * @param res - The response object that will be sent back to the client.
 * @returns The album with the id that was passed in the query string.
 */
export default async function handler(req, res) {
  if (req.query.id) {
    try {
      const album = await prisma.album.findUnique({
        where: {
          id: req.query.id,
        },
        include: ALBUM_INCLUDE,
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ ...album }))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error }))
    }
  }
}
