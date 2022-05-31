import {pickRandom} from '../../../../../utils/api/get'

/**
 * It takes a count parameter from the query string, uses that to pick a random
 * album from the database, and returns the result as JSON
 */
export default async function handler(req, res) {
  const randomAlbum = await pickRandom(Number(req.query.count) || 1)

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  return res.end(JSON.stringify({...randomAlbum}))
}
