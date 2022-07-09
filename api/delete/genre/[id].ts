import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It deletes an genre from the database and returns the deleted genre
 * @param req - The request object.
 * @param res - The response object.
 * @returns The genre that was deleted.
 */
export default async function handler(req, res) {
  const { id } = req.params
  if (id) {
    try {
      const genre = await prisma.genre.delete({
        where: {
          id,
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
