import {PRISMA_CLIENT} from '../../../../utils/api/constants'

/**
 * It creates a new tier in the database
 * @param req - The incoming request object.
 * @param res - The response object.
 * @returns The tier object
 */
export default function handler(req, res) {
  const {id, data} = req.params
  if (id) {
    try {
      const tier = PRISMA_CLIENT.tier.create({
        data,
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({...tier}))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({error}))
    }
  }
}
