import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It creates a new genre in the database
 * @param req - The request object.
 * @param res - The response object.
 * @returns The genre object
 */
export default async function handler(req, res) {
  const { id, data } = req.params
  if (id) {
    try {
      const genre = await prisma.genre.create({
        data,
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ ...genre }))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error }))
    }
  }
}
