import {PRISMA_CLIENT} from '../../../../utils/api/constants'

/**
 * It creates a new artist in the database using the Prisma client
 * @param req - The request object.
 * @param res - The response object.
 * @returns An object with the artist's data
 */
export default function handler(req, res) {
  const {id, data} = req.params
  if (id) {
    try {
      const artist = PRISMA_CLIENT.artist.create({
        data,
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({...artist}))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({error}))
    }
  }
}
