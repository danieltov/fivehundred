import prisma from '../../../lib/prisma'

/**
 * It fetches all artists from the database, and returns them as JSON
 * @param req - The incoming request object.
 * @param res - The response object that will be sent back to the client.
 * @returns An array of artists with their albums
 */
export default async function handler(req, res) {
  try {
    const data = await prisma.artist.findMany({
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
