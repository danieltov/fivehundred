import {PRISMA_CLIENT} from '../../../../utils/api/constants'

/**
 * It deletes an album from the database and returns the deleted album
 * @param req - The request object.
 * @param res - The response object.
 * @returns The album that was deleted.
 */
export default function handler(req, res) {
  const {id} = req.params
  if (id) {
    try {
      const album = PRISMA_CLIENT.album.delete({
        where: {
          id,
        },
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
