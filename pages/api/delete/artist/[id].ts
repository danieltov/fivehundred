import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It deletes an artist from the database and returns the deleted artist
 * @param req - The request object.
 * @param res - The response object.
 * @returns The artist that was deleted.
 */
export default async function handler(req, res) {
  const { id } = req.params
  if (id) {
    try {
      const artist = await prisma.artist.delete({
        where: {
          id,
        },
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
