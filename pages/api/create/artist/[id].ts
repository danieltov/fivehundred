import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It creates a new artist in the database using the Prisma client
 * @param req - The request object.
 * @param res - The response object.
 * @returns An object with the artist's data
 */
export default async function handler(req, res) {
  const { id, data } = req.params
  if (id) {
    try {
      const artist = await prisma.artist.create({
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
