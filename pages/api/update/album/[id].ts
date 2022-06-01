import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It updates an album from the database and returns the updated album
 * @param req - The request object.
 * @param res - The response object.
 * @returns The album that was updated.
 */
export default async function handler(req, res) {
  const { id, data } = req.params
  if (id) {
    try {
      const album = await prisma.album.update({
        where: {
          id,
        },
        data,
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
