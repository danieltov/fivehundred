import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * It takes the id and data from the request parameters, and then uses the Prisma
 * client to update the descriptor with the given id and data
 * @param req - The request object.
 * @param res - The response object that will be sent back to the client.
 * @returns The updated descriptor
 */
export default async function handler(req, res) {
  const { id, data } = req.params
  if (id) {
    try {
      const descriptor = await prisma.descriptor.update({
        where: {
          id,
        },
        data,
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
