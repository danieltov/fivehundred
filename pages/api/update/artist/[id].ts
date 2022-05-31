import {PRISMA_CLIENT} from '../../../../utils/api/constants'

/**
 * It takes an id and data from the request params, and then updates the artist
 * with the given id with the given data
 * @param req - The request object.
 * @param res - The response object.
 * @returns The updated artist
 */
export default function handler(req, res) {
  const {id, data} = req.params
  if (id) {
    try {
      const artist = PRISMA_CLIENT.artist.update({
        where: {
          id,
        },
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
