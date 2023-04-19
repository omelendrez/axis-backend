const jwt = require('jsonwebtoken')
const { log } = require('../helpers/log')
require('dotenv').config()

module.exports = {
  validateToken (req, res, next) {
    const authorizationHeaader = req.headers.authorization
    let result
    if (authorizationHeaader) {
      const token = req.headers.authorization.split(' ')[1]
      try {
        result = jwt.verify(token, process.env.JWT_SECRET)
        req.decoded = result
        next()
      } catch (err) {
        log.error(err)
        if (err.message === 'jwt expired') {
          result = {
            code: 401,
            message: 'Token expired',
            detail:
              'The token needed to acceess this resource has expired, please log in again.'
          }
        } else {
          result = {
            code: 401,
            message: 'Token required',
            detail: err.message
          }
        }
        return res.status(401).send(result)
      }
    } else {
      result = {
        error: 'Authentication error. Token required.',
        status: 401
      }
      return res.status(401).send(result)
    }
  }
}
