import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It deletes an descriptor from the database and returns the deleted descriptor
 * @param req - The request object.
 * @param res - The response object.
 * @returns The descriptor that was deleted.
 */
export default async function handler(req, res) {
  const { id } = req.params
  if (id) {
    try {
      const descriptor = await prisma.descriptor.delete({
        where: {
          id,
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
