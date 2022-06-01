import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It deletes an album from the database and returns the deleted album
 * @param req - The request object.
 * @param res - The response object.
 * @returns The album that was deleted.
 */
export default async function handler(req, res) {
  const { id } = req.params
  if (id) {
    try {
      const album = await prisma.album.delete({
        where: {
          id,
        },
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
