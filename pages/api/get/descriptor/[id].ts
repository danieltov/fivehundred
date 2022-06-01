import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It takes a query parameter called `id` and returns the descriptor with that id
 * @param req - The request object.
 * @param res - The response object that will be sent back to the client.
 * @returns The descriptor with the id that was passed in the query string.
 */
export default async function handler(req, res) {
  if (req.query.id) {
    try {
      const descriptor = await prisma.descriptor.findUnique({
        where: {
          id: req.query.id,
        },
        include: {
          albums: true,
        },
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ ...descriptor }))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error }))
    }
  }
}
