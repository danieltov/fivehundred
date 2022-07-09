import prisma from '../../../../lib/prisma'

/**
 * It creates a new album in the database and returns it
 * @param req - The request object.
 * @param res - The response object.
 * @returns The album object
 */
export default async function handler(req, res) {
  const { id, data } = req.params
  if (id) {
    try {
      const album = await prisma.album.create({
        data,
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ ...album }))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error }))
    }
  }
}
