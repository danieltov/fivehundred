import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It takes a query parameter called id, uses it to query the Prisma database, and
 * returns the result
 * @param req - The request object.
 * @param res - The response object.
 * @returns The genre with the id that was passed in the query string.
 */
export default async function handler(req, res) {
  if (req.query.id) {
    try {
      const genre = await prisma.genre.findUnique({
        where: {
          id: req.query.id,
        },
        include: {
          albums: true,
        },
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
