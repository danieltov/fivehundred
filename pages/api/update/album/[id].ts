import {PRISMA_CLIENT} from '../../../../utils/api/constants'

/**
 * It updates an album from the database and returns the updated album
 * @param req - The request object.
 * @param res - The response object.
 * @returns The album that was updated.
 */
export default function handler(req, res) {
  const {id, data} = req.params
  if (id) {
    try {
      const album = PRISMA_CLIENT.album.update({
        where: {
          id,
        },
        data,
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({...album}))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({error}))
    }
  }
}
