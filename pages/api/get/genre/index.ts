import prisma from '../../../../lib/prisma'

/**
 * It fetches all genres from the database, and returns them as JSON
 * @param req - The request object.
 * @param res - The response object.
 * @returns An array of genres with their albums
 */
export default async function handler(req, res) {
  try {
    const data = await prisma.genre.findMany({
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
