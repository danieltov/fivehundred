import {PRISMA_CLIENT} from '../../../../utils/api/constants'

/**
 * It creates a new genre in the database
 * @param req - The request object.
 * @param res - The response object.
 * @returns The genre object
 */
export default function handler(req, res) {
  const {id, data} = req.params
  if (id) {
    try {
      const genre = PRISMA_CLIENT.genre.create({
        data,
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({...genre}))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({error}))
    }
  }
}
