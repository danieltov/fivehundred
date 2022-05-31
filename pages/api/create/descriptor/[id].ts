import {PRISMA_CLIENT} from '../../../../utils/api/constants'

/**
 * It creates a new descriptor in the database
 * @param req - The incoming request object.
 * @param res - The response object that will be sent back to the client.
 * @returns The descriptor object
 */
export default function handler(req, res) {
  const {id, data} = req.params
  if (id) {
    try {
      const descriptor = PRISMA_CLIENT.descriptor.create({
        data,
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({...descriptor}))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({error}))
    }
  }
}
