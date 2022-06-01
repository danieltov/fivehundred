import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It takes an id and data from the request params, and then updates the artist
 * with the given id with the given data
 * @param req - The request object.
 * @param res - The response object.
 * @returns The updated artist
 */
export default async function handler(req, res) {
  const { id, data } = req.params
  if (id) {
    try {
      const artist = await prisma.artist.update({
        where: {
          id,
        },
        data,
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ ...artist }))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error }))
    }
  }
}
