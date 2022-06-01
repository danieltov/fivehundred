import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It deletes an tier from the database and returns the deleted tier
 * @param req - The request object.
 * @param res - The response object.
 * @returns The tier that was deleted.
 */
export default async function handler(req, res) {
  const { id } = req.params
  if (id) {
    try {
      const tier = await prisma.tier.delete({
        where: {
          id,
        },
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ ...tier }))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error }))
    }
  }
}
