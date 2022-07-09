import prisma from '../../../../lib/prisma'

/**
 * It fetches all descriptors and their associated albums from the database and
 * returns them as JSON
 * @param req - The incoming HTTP request.
 * @param res - The response object.
 * @returns An array of descriptors with their associated albums.
 */
export default async function handler(req, res) {
  try {
    const data = await prisma.descriptor.findMany({
      include: { albums: true },
    })
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ data }))
  } catch (error) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error }))
  }
}
