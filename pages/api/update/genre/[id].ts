import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It takes the id and data from the request parameters, and then uses the Prisma
 * Client to update the genre with the given id with the given data
 * @param req - The request object.
 * @param res - The response object.
 * @returns The updated genre
 */
export default async function handler(req, res) {
  const { id, data } = req.params
  if (id) {
    try {
      const genre = await prisma.genre.update({
        where: {
          id,
        },
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
