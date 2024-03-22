const NodeCache = require('node-cache')

const cache = new NodeCache()

const MODELS = {
  APPROVAL: 'api/approval',
  TRAINING: 'api/training',
  LEARNER: 'api/learner'
}
const send = (res) => res.status(200).json(res.locals.data)

const getUrlFromRequest = (req) => {
  // const url = req.protocol + '://' + req.headers.host + req.originalUrl
  const url = req.originalUrl
  return url
}

const getModelFromUrl = (req) => {
  // model => "api/company"

  return req.originalUrl
    .split('?')[0]
    .split('/')
    .filter((u) => u)
    .filter((u, i) => i < 2)
    .join('/')
}

/**
 *
 * @param {HTTP request object} req
 * @param {HTTP response object} res
 * @param {next method} next
 * @returns If exists url cached data it returns it otherwise returns control to next middleware
 */
const get = (req, res, next) => {
  const url = getUrlFromRequest(req)

  const content = cache.get(url)
  if (content) {
    // Process ends here if there is cache for the url
    return res.status(200).send(content)
  }
  // No cache found so we get data from database (controller)
  return next()
}

/**
 *
 * @param {HTTP request object} req
 * @param {HTTP response object} res
 * @param {next method} next
 * @returns Stores request object passed data (locals.data) into cache for the current url
 */
const set = (req, res, next) => {
  const url = getUrlFromRequest(req)
  // res.locals.data is a custom object added to response object in controller
  cache.set(url, res.locals.data)
  return next()
}

/**
 *
 * @param {HTTP request object} req
 * @param {HTTP response object} res
 * @param {next method} next
 * @returns Invalidates cache
 */
const del = async (req, res, next) => {
  // cache.keys() => ["api/company?limit=100&search=spdc", "api/company/1234"]
  const model = getModelFromUrl(req)
  // The model name is in the url in most of the endpoints

  // The only model name that is not part of the endpoint url is 'api/approval'
  // so we need to specifically check for that model in order to invalidate related models' cache

  for (const key of cache.keys()) {
    if (
      key.includes(model) ||
      (model === MODELS.APPROVAL &&
        (key.includes(MODELS.TRAINING) || key.includes(MODELS.LEARNER)))
    ) {
      await cache.del(key)
    }
  }

  return next()
}

/**
 *
 * @param {HTTP request object} req
 * @param {HTTP response object} res
 * @param {next method} next
 * @returns Returs retrieved data for GET HTTP method, otherwise invalidate cache
 */
const res = (req, res, next) => {
  // GET HTTP method reaches here if no cache found for that url
  // Otherwise middleware stops right after 'get' method
  if (req.method === 'GET') {
    return send(res)
  }
  // This is a database update so we invalidate the cache
  del(req, res, next)
}

module.exports = { res, get, set }
