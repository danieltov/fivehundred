import {PRISMA_CLIENT} from '../../../../utils/api/constants'

/**
 * It takes in a request and a response object, and then it updates a tier in the
 * database with the data provided in the request
 * @param req - The request object.
 * @param res - The response object.
 * @returns The updated tier
 */
export default function handler(req, res) {
  const {id, data} = req.params
  if (id) {
    try {
      const tier = PRISMA_CLIENT.tier.update({
        where: {
          id,
        },
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
