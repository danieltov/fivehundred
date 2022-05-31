import {PRISMA_CLIENT} from '../../../../utils/api/constants'

/**
 * It deletes an artist from the database and returns the deleted artist
 * @param req - The request object.
 * @param res - The response object.
 * @returns The artist that was deleted.
 */
export default function handler(req, res) {
  const {id} = req.params
  if (id) {
    try {
      const artist = PRISMA_CLIENT.artist.delete({
        where: {
          id,
        },
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
