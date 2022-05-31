import {pickRandom} from '../../../../../utils/api/get'

/**
 * It picks a random album from the database, and returns it as a JSON object
 * @param req - The incoming request object.
 * @param res - The response object.
 * @returns A JSON object with the album information.
 */
export default async function handler(req, res) {
  const randomAlbum = await pickRandom(1)

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  return res.end(JSON.stringify({...randomAlbum}))
}
